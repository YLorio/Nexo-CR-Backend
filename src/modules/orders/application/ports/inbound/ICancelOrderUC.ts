/**
 * Puerto de entrada: Caso de uso para cancelar una orden
 */
export interface CancelOrderCommand {
  tenantId: string;
  orderId: string;
  reason?: string; // Motivo de cancelación (opcional)
}

export interface CancelledOrderDTO {
  id: string;
  orderNumber: number;
  displayId: string;
  status: string;
  cancelledAt: Date;
  // Información de reversión
  stockRestored: StockRestoredItem[];
  slotsReleased: SlotReleasedItem[];
}

export interface StockRestoredItem {
  productId: string;
  productName: string;
  quantityRestored: number;
}

export interface SlotReleasedItem {
  productId: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export interface ICancelOrderUC {
  /**
   * Cancela una orden existente
   * - Revierte el stock de productos físicos
   * - Libera los slots de servicios (automático por cambio de estado)
   * - Marca la orden como CANCELLED
   *
   * @throws OrderNotFoundError si la orden no existe
   * @throws InvalidOrderStatusTransitionError si no se puede cancelar
   */
  execute(command: CancelOrderCommand): Promise<CancelledOrderDTO>;
}

export const CANCEL_ORDER_UC = Symbol('ICancelOrderUC');
