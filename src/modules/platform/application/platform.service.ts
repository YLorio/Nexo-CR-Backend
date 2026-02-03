import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTenantDto } from '../infrastructure/http/dto/create-tenant.dto';
import { ListTenantsQueryDto, PaginatedTenantsDto } from '../infrastructure/http/dto/list-tenants.dto';
import { RolUsuario, TipoPlan, EstadoUsuario, Moneda } from '@prisma/client';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto) {
    // Verificar que el slug no exista
    const existingTenant = await this.prisma.negocio.findUnique({
      where: { slug: dto.slug },
    });

    if (existingTenant) {
      throw new ConflictException(`El slug "${dto.slug}" ya está en uso`);
    }

    // Verificar que el email del owner no exista
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: dto.ownerEmail.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(`El email "${dto.ownerEmail}" ya está registrado`);
    }

    // Hash de la contraseña
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
    });

    return {
      tenant: {
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
    };
  }

  async listTenants(query: ListTenantsQueryDto): Promise<PaginatedTenantsDto> {
    const { page = 1, limit = 10, search, isActive, planType } = query;
    const skip = (page - 1) * limit;

    // Mapear planType a español
    const tipoPlanMap: Record<string, TipoPlan> = {
      'FREE': TipoPlan.GRATIS,
      'BASIC': TipoPlan.BASICO,
      'PREMIUM': TipoPlan.PREMIUM,
    };

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
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
            },
          },
        },
      }),
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTenantById(id: string) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productos: true,
            pedidos: true,
            categorias: true,
          },
        },
      },
    });

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
      } : null,
    };
  }

  async toggleTenantStatus(id: string, isActive: boolean) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
    });

    if (!negocio) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const updated = await this.prisma.negocio.update({
      where: { id },
      data: { activo: isActive },
    });

    return {
      id: updated.id,
      name: updated.nombre,
      isActive: updated.activo,
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
      this.prisma.negocio.count(),
      this.prisma.negocio.count({ where: { activo: true } }),
      this.prisma.usuario.count({ where: { rol: RolUsuario.DUENO_NEGOCIO } }),
      this.prisma.pedido.count(),
      this.prisma.negocio.groupBy({
        by: ['tipoPlan'],
        _count: true,
      }),
    ]);

    const planStats = planCounts.reduce(
      (acc, item) => {
        acc[item.tipoPlan] = item._count;
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
        FREE: planStats.GRATIS || 0,
        BASIC: planStats.BASICO || 0,
        PREMIUM: planStats.PREMIUM || 0,
      },
    };
  }
}
