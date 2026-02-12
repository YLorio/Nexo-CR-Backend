/**
 * Puerto de salida para consultas de Tenant
 * Define las operaciones de lectura necesarias
 */
export interface TenantPublicInfo {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
  bannerUrls: string[]; // Array de URLs de banners (max 3)
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  trustBadges?: any;
  showTrustBadges: boolean;
  whatsappNumber: string;
  currency: string;
  isActive: boolean;
  theme?: {
    config: any;
    layoutConfig?: any;
    fontFamilyHeading: string;
    fontFamilyBody: string;
  };
}

export interface ITenantQueryRepository {
  /**
   * Busca un tenant por su slug único
   */
  findBySlug(slug: string): Promise<TenantPublicInfo | null>;
}
