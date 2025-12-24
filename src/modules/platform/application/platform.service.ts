import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTenantDto } from '../infrastructure/http/dto/create-tenant.dto';
import { ListTenantsQueryDto, PaginatedTenantsDto } from '../infrastructure/http/dto/list-tenants.dto';
import { UserRole, PlanType, UserStatus, Currency } from '@prisma/client';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto) {
    // Verificar que el slug no exista
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });

    if (existingTenant) {
      throw new ConflictException(`El slug "${dto.slug}" ya está en uso`);
    }

    // Verificar que el email del owner no exista
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.ownerEmail.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(`El email "${dto.ownerEmail}" ya está registrado`);
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(dto.ownerPassword, 10);

    // Crear tenant y owner en una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear el tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          whatsappNumber: dto.whatsappNumber,
          email: dto.email,
          primaryColor: dto.primaryColor || '#6366f1',
          accentColor: dto.accentColor || '#f59e0b',
          logo: dto.logoUrl,
          defaultCurrency: (dto.currency as Currency) || Currency.CRC,
          planType: (dto.planType as PlanType) || PlanType.FREE,
          isActive: true,
        },
      });

      // Crear el owner (sin tenantId)
      const owner = await tx.user.create({
        data: {
          email: dto.ownerEmail.toLowerCase(),
          passwordHash,
          firstName: dto.ownerName.split(' ')[0],
          lastName: dto.ownerName.split(' ').slice(1).join(' ') || '',
          role: UserRole.TENANT_OWNER,
          status: UserStatus.ACTIVE,
        },
      });

      // Crear la relación TenantStaff para vincular el owner con el tenant
      await tx.tenantStaff.create({
        data: {
          tenantId: tenant.id,
          userId: owner.id,
          role: UserRole.TENANT_OWNER,
        },
      });

      // Crear contador de órdenes para el tenant
      await tx.tenantOrderCounter.create({
        data: {
          tenantId: tenant.id,
          lastNumber: 0,
        },
      });

      return { tenant, owner };
    });

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        whatsappNumber: result.tenant.whatsappNumber,
        email: result.tenant.email,
        primaryColor: result.tenant.primaryColor,
        accentColor: result.tenant.accentColor,
        logoUrl: result.tenant.logo,
        currency: result.tenant.defaultCurrency,
        planType: result.tenant.planType,
        isActive: result.tenant.isActive,
        createdAt: result.tenant.createdAt,
      },
      owner: {
        id: result.owner.id,
        name: (result.owner.firstName || "") + " " + (result.owner.lastName || "").trim(),
        email: result.owner.email,
      },
      storeUrl: `/${result.tenant.slug}`,
    };
  }

  async listTenants(query: ListTenantsQueryDto): Promise<PaginatedTenantsDto> {
    const { page = 1, limit = 10, search, isActive, planType } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (planType) {
      where.planType = planType;
    }

    // Ejecutar consultas en paralelo
    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          staff: {
            where: { role: UserRole.TENANT_OWNER },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            take: 1,
          },
          _count: {
            select: {
              inventoryItems: true,
              serviceDefinitions: true,
              orders: true,
            },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        whatsappNumber: tenant.whatsappNumber,
        email: tenant.email,
        logoUrl: tenant.logo,
        primaryColor: tenant.primaryColor,
        accentColor: tenant.accentColor,
        currency: tenant.defaultCurrency,
        planType: tenant.planType,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        owner: tenant.staff[0] ? {
          id: tenant.staff[0].user.id,
          name: (tenant.staff[0].user.firstName || "") + " " + (tenant.staff[0].user.lastName || "").trim(),
          email: tenant.staff[0].user.email,
        } : undefined,
        _count: {
          inventoryItems: tenant._count.inventoryItems,
          serviceDefinitions: tenant._count.serviceDefinitions,
          orders: tenant._count.orders,
          products: tenant._count.inventoryItems + tenant._count.serviceDefinitions,
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        staff: {
          where: { role: UserRole.TENANT_OWNER },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                createdAt: true,
                lastLoginAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            inventoryItems: true,
            serviceDefinitions: true,
            orders: true,
            categories: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    return {
      ...tenant,
      owner: tenant.staff[0] ? {
        id: tenant.staff[0].user.id,
        name: (tenant.staff[0].user.firstName || "") + " " + (tenant.staff[0].user.lastName || "").trim(),
        email: tenant.staff[0].user.email,
        isActive: tenant.staff[0].user.status === UserStatus.ACTIVE,
        createdAt: tenant.staff[0].user.createdAt,
        lastLoginAt: tenant.staff[0].user.lastLoginAt,
      } : null,
    };
  }

  async toggleTenantStatus(id: string, isActive: boolean) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { isActive },
    });

    return {
      id: updated.id,
      name: updated.name,
      isActive: updated.isActive,
    };
  }

  async getStats() {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      totalOrders,
      planCounts,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: UserRole.TENANT_OWNER } }),
      this.prisma.order.count(),
      this.prisma.tenant.groupBy({
        by: ['planType'],
        _count: true,
      }),
    ]);

    const planStats = planCounts.reduce(
      (acc, item) => {
        acc[item.planType] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        inactive: totalTenants - activeTenants,
      },
      users: totalUsers,
      orders: totalOrders,
      planDistribution: {
        FREE: planStats.FREE || 0,
        BASIC: planStats.BASIC || 0,
        PREMIUM: planStats.PREMIUM || 0,
      },
    };
  }
}
