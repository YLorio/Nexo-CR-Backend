import { PrismaClient } from '@prisma/client';
import { ITenantQueryRepository, TenantPublicInfo } from '../../application/ports/outbound';

/**
 * Implementacion Prisma del repositorio de consultas de Tenant
 */
export class PrismaTenantQueryRepository implements ITenantQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<TenantPublicInfo | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        logo: true,
        primaryColor: true,
        accentColor: true,
        backgroundColor: true,
        trustBadges: true,
        showTrustBadges: true,
        whatsappNumber: true,
        defaultCurrency: true,
        isActive: true,
        theme: {
          select: {
            config: true,
            layoutConfig: true,
            fontFamilyHeading: true,
            fontFamilyBody: true,
          }
        },
        banners: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 3,
          select: { imageUrl: true },
        },
      },
    });

    if (!tenant) return null;

    // Extraer URLs de banners
    const bannerUrls = tenant.banners?.map(b => b.imageUrl) || [];

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      tagline: tenant.tagline,
      logoUrl: tenant.logo,
      bannerUrls,
      primaryColor: tenant.primaryColor,
      accentColor: tenant.accentColor,
      backgroundColor: tenant.backgroundColor,
      trustBadges: tenant.trustBadges as any,
      showTrustBadges: tenant.showTrustBadges,
      whatsappNumber: tenant.whatsappNumber || '',
      currency: tenant.defaultCurrency,
      isActive: tenant.isActive,
      theme: tenant.theme ? {
        config: tenant.theme.config,
        layoutConfig: tenant.theme.layoutConfig,
        fontFamilyHeading: tenant.theme.fontFamilyHeading,
        fontFamilyBody: tenant.theme.fontFamilyBody,
      } : undefined,
    };
  }
}
