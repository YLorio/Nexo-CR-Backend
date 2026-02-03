import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTenantDto } from '../infrastructure/http/dto/create-tenant.dto';
import { ListTenantsQueryDto, PaginatedTenantsDto } from '../infrastructure/http/dto/list-tenants.dto';
<<<<<<< HEAD
import { RolUsuario, TipoPlan, EstadoUsuario, Moneda } from '@prisma/client';
=======
import { UserRole, PlanType, UserStatus, Currency } from '@prisma/client';
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto) {
    // Verificar que el slug no exista
<<<<<<< HEAD
    const existingTenant = await this.prisma.negocio.findUnique({
=======
    const existingTenant = await this.prisma.tenant.findUnique({
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      where: { slug: dto.slug },
    });

    if (existingTenant) {
      throw new ConflictException(`El slug "${dto.slug}" ya está en uso`);
    }

    // Verificar que el email del owner no exista
<<<<<<< HEAD
    const existingUser = await this.prisma.usuario.findUnique({
=======
    const existingUser = await this.prisma.user.findUnique({
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      where: { email: dto.ownerEmail.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(`El email "${dto.ownerEmail}" ya está registrado`);
    }

    // Hash de la contraseña
<<<<<<< HEAD
    const contrasenaHash = await bcrypt.hash(dto.ownerPassword, 10);

    // Mapear currency y planType a español
    const monedaMap: Record<string, Moneda> = {
      'CRC': Moneda.CRC,
      'USD': Moneda.USD,
    };
    const tipoPlanMap: Record<string, TipoPlan> = {
      'FREE': TipoPlan.GRATIS,
      'BASIC': TipoPlan.BASICO,
      'PREMIUM': TipoPlan.PREMIUM,
    };

    // Crear negocio y owner en una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear el negocio
      const negocio = await tx.negocio.create({
        data: {
          nombre: dto.name,
          slug: dto.slug,
          whatsapp: dto.whatsappNumber,
          email: dto.email,
          colorPrimario: dto.primaryColor || '#6366f1',
          colorSecundario: dto.accentColor || '#f59e0b',
          logo: dto.logoUrl,
          moneda: monedaMap[dto.currency || 'CRC'] || Moneda.CRC,
          tipoPlan: tipoPlanMap[dto.planType || 'FREE'] || TipoPlan.GRATIS,
          activo: true,
        },
      });

      // Crear el owner con negocioId directo
      const owner = await tx.usuario.create({
        data: {
          email: dto.ownerEmail.toLowerCase(),
          contrasenaHash,
          nombre: dto.ownerName.split(' ')[0],
          apellido: dto.ownerName.split(' ').slice(1).join(' ') || '',
          rol: RolUsuario.DUENO_NEGOCIO,
          estado: EstadoUsuario.ACTIVO,
          negocioId: negocio.id,
        },
      });

      // Crear contador de pedidos para el negocio
      await tx.contadorPedidos.create({
        data: {
          negocioId: negocio.id,
          ultimoNumero: 0,
        },
      });

      return { negocio, owner };
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    });

    return {
      tenant: {
<<<<<<< HEAD
        id: result.negocio.id,
        name: result.negocio.nombre,
        slug: result.negocio.slug,
        whatsappNumber: result.negocio.whatsapp,
        email: result.negocio.email,
        primaryColor: result.negocio.colorPrimario,
        accentColor: result.negocio.colorSecundario,
        logoUrl: result.negocio.logo,
        currency: result.negocio.moneda,
        planType: result.negocio.tipoPlan,
        isActive: result.negocio.activo,
        createdAt: result.negocio.creadoEn,
      },
      owner: {
        id: result.owner.id,
        name: (result.owner.nombre || "") + " " + (result.owner.apellido || "").trim(),
        email: result.owner.email,
      },
      storeUrl: `/${result.negocio.slug}`,
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    };
  }

  async listTenants(query: ListTenantsQueryDto): Promise<PaginatedTenantsDto> {
    const { page = 1, limit = 10, search, isActive, planType } = query;
    const skip = (page - 1) * limit;

<<<<<<< HEAD
    // Mapear planType a español
    const tipoPlanMap: Record<string, TipoPlan> = {
      'FREE': TipoPlan.GRATIS,
      'BASIC': TipoPlan.BASICO,
      'PREMIUM': TipoPlan.PREMIUM,
    };

=======
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
<<<<<<< HEAD
        { nombre: { contains: search } },
=======
        { name: { contains: search } },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        { slug: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
<<<<<<< HEAD
      where.activo = isActive;
    }

    if (planType) {
      where.tipoPlan = tipoPlanMap[planType] || planType;
    }

    // Ejecutar consultas en paralelo
    const [negocios, total] = await Promise.all([
      this.prisma.negocio.findMany({
        where,
        skip,
        take: limit,
        orderBy: { creadoEn: 'desc' },
        include: {
          _count: {
            select: {
              productos: true,
              pedidos: true,
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
            },
          },
        },
      }),
<<<<<<< HEAD
      this.prisma.negocio.count({ where }),
    ]);

    // Obtener owners por separado (usuarios con negocioId)
    const negocioIds = negocios.map(t => t.id);
    const owners = await this.prisma.usuario.findMany({
      where: {
        negocioId: { in: negocioIds },
        rol: RolUsuario.DUENO_NEGOCIO,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        negocioId: true,
      },
    });

    const ownersByNegocio = owners.reduce((acc, owner) => {
      if (owner.negocioId) {
        acc[owner.negocioId] = owner;
      }
      return acc;
    }, {} as Record<string, typeof owners[0]>);

    return {
      data: negocios.map((negocio) => {
        const owner = ownersByNegocio[negocio.id];
        return {
          id: negocio.id,
          name: negocio.nombre,
          slug: negocio.slug,
          whatsappNumber: negocio.whatsapp,
          email: negocio.email,
          logoUrl: negocio.logo,
          primaryColor: negocio.colorPrimario,
          accentColor: negocio.colorSecundario,
          currency: negocio.moneda,
          planType: negocio.tipoPlan,
          isActive: negocio.activo,
          createdAt: negocio.creadoEn,
          owner: owner ? {
            id: owner.id,
            name: (owner.nombre || "") + " " + (owner.apellido || "").trim(),
            email: owner.email,
          } : undefined,
          _count: {
            inventoryItems: negocio._count.productos,
            orders: negocio._count.pedidos,
            products: negocio._count.productos,
          },
        };
      }),
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTenantById(id: string) {
<<<<<<< HEAD
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productos: true,
            pedidos: true,
            categorias: true,
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
          },
        },
      },
    });

<<<<<<< HEAD
    if (!negocio) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Buscar owner
    const owner = await this.prisma.usuario.findFirst({
      where: {
        negocioId: id,
        rol: RolUsuario.DUENO_NEGOCIO,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        estado: true,
        creadoEn: true,
        ultimoLoginEn: true,
      },
    });

    return {
      ...negocio,
      owner: owner ? {
        id: owner.id,
        name: (owner.nombre || "") + " " + (owner.apellido || "").trim(),
        email: owner.email,
        isActive: owner.estado === EstadoUsuario.ACTIVO,
        createdAt: owner.creadoEn,
        lastLoginAt: owner.ultimoLoginEn,
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      } : null,
    };
  }

  async toggleTenantStatus(id: string, isActive: boolean) {
<<<<<<< HEAD
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
    });

    if (!negocio) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const updated = await this.prisma.negocio.update({
      where: { id },
      data: { activo: isActive },
=======
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { isActive },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    });

    return {
      id: updated.id,
<<<<<<< HEAD
      name: updated.nombre,
      isActive: updated.activo,
=======
      name: updated.name,
      isActive: updated.isActive,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
      this.prisma.negocio.count(),
      this.prisma.negocio.count({ where: { activo: true } }),
      this.prisma.usuario.count({ where: { rol: RolUsuario.DUENO_NEGOCIO } }),
      this.prisma.pedido.count(),
      this.prisma.negocio.groupBy({
        by: ['tipoPlan'],
=======
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: UserRole.TENANT_OWNER } }),
      this.prisma.order.count(),
      this.prisma.tenant.groupBy({
        by: ['planType'],
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        _count: true,
      }),
    ]);

    const planStats = planCounts.reduce(
      (acc, item) => {
<<<<<<< HEAD
        acc[item.tipoPlan] = item._count;
=======
        acc[item.planType] = item._count;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
        FREE: planStats.GRATIS || 0,
        BASIC: planStats.BASICO || 0,
=======
        FREE: planStats.FREE || 0,
        BASIC: planStats.BASIC || 0,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        PREMIUM: planStats.PREMIUM || 0,
      },
    };
  }
}
