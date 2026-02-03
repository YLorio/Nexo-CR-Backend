import { PrismaClient } from '@prisma/client';
import { ITenantQueryRepository, TenantPublicInfo } from '../../application/ports/outbound';

/**
<<<<<<< HEAD
 * Implementacion Prisma del repositorio de consultas de Negocio (Tenant)
=======
 * Implementacion Prisma del repositorio de consultas de Tenant
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 */
export class PrismaTenantQueryRepository implements ITenantQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<TenantPublicInfo | null> {
<<<<<<< HEAD
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
=======
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        primaryColor: true,
        accentColor: true,
        whatsappNumber: true,
        defaultCurrency: true,
        isActive: true,
        banners: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 3,
          select: { imageUrl: true },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        },
      },
    });

<<<<<<< HEAD
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
=======
    if (!tenant) return null;

    // Extraer URLs de banners
    const bannerUrls = tenant.banners?.map(b => b.imageUrl) || [];

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logoUrl: tenant.logo,
      bannerUrls,
      primaryColor: tenant.primaryColor,
      accentColor: tenant.accentColor,
      whatsappNumber: tenant.whatsappNumber || '',
      currency: tenant.defaultCurrency,
      isActive: tenant.isActive,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    };
  }
}
