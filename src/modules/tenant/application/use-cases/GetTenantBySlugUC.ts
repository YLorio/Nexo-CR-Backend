import { IGetTenantBySlugUC } from '../ports/inbound';
import { ITenantQueryRepository, TenantPublicInfo } from '../ports/outbound';
import { TenantNotFoundError, TenantInactiveError } from '../../domain/errors';

/**
 * Caso de uso: Obtener información pública de un tenant por su slug
 *
 * Utilizado por el frontend para cargar la configuración visual
 * (colores, logo) al entrar a la tienda de un negocio.
 */
export class GetTenantBySlugUC implements IGetTenantBySlugUC {
  constructor(private readonly tenantQueryRepo: ITenantQueryRepository) {}

  async execute(slug: string): Promise<TenantPublicInfo> {
    // Normalizar el slug (minúsculas, sin espacios)
    const normalizedSlug = slug.toLowerCase().trim();

    // Buscar el tenant
    const tenant = await this.tenantQueryRepo.findBySlug(normalizedSlug);

    if (!tenant) {
      throw new TenantNotFoundError(normalizedSlug);
    }

    // Verificar que esté activo
    if (!tenant.isActive) {
      throw new TenantInactiveError(normalizedSlug);
    }

    return tenant;
  }
}
