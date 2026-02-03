import { PrismaClient } from '@prisma/client';
import { ITenantQueryRepository, TenantPublicInfo } from '../../application/ports/outbound';

/**
 * Implementacion Prisma del repositorio de consultas de Negocio (Tenant)
 */
export class PrismaTenantQueryRepository implements ITenantQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<TenantPublicInfo | null> {
    const negocio = await this.prisma.negocio.findUnique({
      where: { slug },
      select: {
        id: true,
        nombre: true,
        slug: true,
        eslogan: true,
        logo: true,
        colorPrimario: true,
        colorSecundario: true,
        whatsapp: true,
        moneda: true,
        activo: true,
        banners: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
          take: 3,
          select: { urlImagen: true },
        },
      },
    });

    if (!negocio) return null;

    // Extraer URLs de banners
    const bannerUrls = negocio.banners?.map(b => b.urlImagen) || [];

    return {
      id: negocio.id,
      name: negocio.nombre,
      slug: negocio.slug,
      tagline: negocio.eslogan,
      logoUrl: negocio.logo,
      bannerUrls,
      primaryColor: negocio.colorPrimario,
      accentColor: negocio.colorSecundario,
      whatsappNumber: negocio.whatsapp || '',
      currency: negocio.moneda,
      isActive: negocio.activo,
    };
  }
}
