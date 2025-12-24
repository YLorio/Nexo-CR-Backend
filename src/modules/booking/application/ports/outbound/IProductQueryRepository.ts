/**
 * Puerto de salida: Consultas de productos/servicios
 * Interface simplificada para obtener información de servicios
 */
export interface ServiceInfo {
  id: string;
  tenantId: string;
  name: string;
  durationMinutes: number;
  priceInCents: number;
  isActive: boolean;
}

export interface IProductQueryRepository {
  /**
   * Obtiene la información de un servicio por su ID
   * Solo retorna si es un servicio (isService = true)
   */
  findServiceById(productId: string): Promise<ServiceInfo | null>;

  /**
   * Obtiene todos los servicios activos de un tenant
   */
  findActiveServicesByTenant(tenantId: string): Promise<ServiceInfo[]>;
}

export const PRODUCT_QUERY_REPOSITORY = Symbol('IProductQueryRepository');
