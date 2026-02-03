/**
 * Puerto de entrada: Caso de uso para crear una orden
 */
export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
}

export type PaymentMethodType = 'SINPE_MOVIL' | 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

export interface CreateOrderCommand {
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNotes?: string;
  paymentMethod?: PaymentMethodType;
  items: CreateOrderItemDTO[];
}

export interface CreatedOrderDTO {
  id: string;
  tenantId: string;
  orderNumber: number;
  displayId: string;  // "#0001"
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  paymentMethod: PaymentMethodType;
  subtotalInCents: number;
  totalInCents: number;
  totalFormatted: string;
  customerNotes: string | null;
  createdAt: Date;
  items: CreatedOrderItemDTO[];
}

export interface CreatedOrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
  subtotalInCents: number;
}

export interface ICreateOrderUC {
  /**
   * Crea una nueva orden
   * Verifica stock de productos
   * Ejecuta todo en una transacción atómica
   *
   * @throws InsufficientStockError si no hay suficiente stock
   * @throws ProductNotFoundError si algún producto no existe
   * @throws TenantNotFoundError si el tenant no existe
   */
  execute(command: CreateOrderCommand): Promise<CreatedOrderDTO>;
}

export const CREATE_ORDER_UC = Symbol('ICreateOrderUC');
