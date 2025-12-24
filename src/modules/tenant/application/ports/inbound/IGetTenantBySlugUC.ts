import { TenantPublicInfo } from '../outbound/ITenantQueryRepository';

/**
 * Puerto de entrada para obtener información pública de un tenant
 */
export interface IGetTenantBySlugUC {
  execute(slug: string): Promise<TenantPublicInfo>;
}

export const GET_TENANT_BY_SLUG_UC = Symbol('IGetTenantBySlugUC');
