import { Order } from '../../../domain/entities';
import { OrderStatusEnum } from '../../../domain/value-objects';

/**
 * Puerto de salida: Repositorio de órdenes
 */
export interface IOrderRepository {
  /**
   * Guarda una nueva orden
   */
  save(order: Order): Promise<Order>;

  /**
   * Busca una orden por ID
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Busca una orden por tenant y número de orden
   */
  findByTenantAndNumber(tenantId: string, orderNumber: number): Promise<Order | null>;

  /**
   * Obtiene órdenes por tenant con filtros opcionales
   */
  findByTenant(
    tenantId: string,
    options?: {
      status?: OrderStatusEnum;
      limit?: number;
      offset?: number;
    },
  ): Promise<Order[]>;

  /**
   * Actualiza una orden existente
   */
  update(order: Order): Promise<Order>;

  /**
   * Obtiene el siguiente número de orden para un tenant
   */
  getNextOrderNumber(tenantId: string): Promise<number>;
}

export const ORDER_REPOSITORY = Symbol('IOrderRepository');
