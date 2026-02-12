/**
 * Puerto de entrada: Caso de uso para crear una orden
 */
export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
  // Solo para servicios
  appointmentDate?: string;  // "YYYY-MM-DD"
  appointmentTime?: string;  // "HH:mm"
}

export type PaymentMethodType = 'CASH' | 'CARD' | 'TRANSFER' | 'SINPE_MOVIL' | 'OTHER';

export interface ShippingAddressDTO {
  provincia: string;
  canton: string;
  distrito: string;
  detalles: string;
}

export interface CreateOrderCommand {
  tenantId: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNotes?: string;
  paymentMethod?: PaymentMethodType;
  shippingAddress?: ShippingAddressDTO;
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
  isService: boolean;
  unitPriceInCents: number;
  quantity: number;
  subtotalInCents: number;
  // Solo para servicios
  appointmentDate: string | null;
  appointmentTime: string | null;
  durationMinutes: number | null;
}

export interface ICreateOrderUC {
  /**
   * Crea una nueva orden
   * Verifica stock (productos) y disponibilidad (servicios)
   * Ejecuta todo en una transacción atómica
   *
   * @throws InsufficientStockError si no hay suficiente stock
   * @throws SlotNotAvailableError si el slot no está disponible
   * @throws ProductNotFoundError si algún producto no existe
   * @throws TenantNotFoundError si el tenant no existe
   */
  execute(command: CreateOrderCommand): Promise<CreatedOrderDTO>;
}

export const CREATE_ORDER_UC = Symbol('ICreateOrderUC');
