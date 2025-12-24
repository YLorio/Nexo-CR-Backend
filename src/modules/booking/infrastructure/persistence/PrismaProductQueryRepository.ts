import { PrismaClient } from '@prisma/client';
import { IProductQueryRepository, ServiceInfo } from '../../application/ports/outbound';

/**
 * Implementación Prisma del repositorio de consultas de productos/servicios
 * Usa ServiceDefinition para consultar servicios
 */
export class PrismaProductQueryRepository implements IProductQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findServiceById(productId: string): Promise<ServiceInfo | null> {
    const service = await this.prisma.serviceDefinition.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        durationMinutes: true,
        basePriceInCents: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!service || service.deletedAt) {
      return null;
    }

    return {
      id: service.id,
      tenantId: service.tenantId,
      name: service.name,
      durationMinutes: service.durationMinutes,
      priceInCents: service.basePriceInCents,
      isActive: service.isActive,
    };
  }

  async findActiveServicesByTenant(tenantId: string): Promise<ServiceInfo[]> {
    const services = await this.prisma.serviceDefinition.findMany({
      where: {
        tenantId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        durationMinutes: true,
        basePriceInCents: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return services.map((s) => ({
      id: s.id,
      tenantId: s.tenantId,
      name: s.name,
      durationMinutes: s.durationMinutes,
      priceInCents: s.basePriceInCents,
      isActive: s.isActive,
    }));
  }
}
