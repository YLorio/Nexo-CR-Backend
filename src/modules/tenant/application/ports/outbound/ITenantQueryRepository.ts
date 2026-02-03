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
  whatsappNumber: string;
  currency: string;
  isActive: boolean;
}

export interface ITenantQueryRepository {
  /**
   * Busca un tenant por su slug único
   */
  findBySlug(slug: string): Promise<TenantPublicInfo | null>;
}
