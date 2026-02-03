/**
 * Puerto de entrada: Caso de uso para crear una orden
 */
export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
<<<<<<< HEAD
}

export type PaymentMethodType = 'SINPE_MOVIL' | 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
=======
  // Solo para servicios
  appointmentDate?: string;  // "YYYY-MM-DD"
  appointmentTime?: string;  // "HH:mm"
}

export type PaymentMethodType = 'SINPE' | 'CASH';
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

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
<<<<<<< HEAD
  unitPriceInCents: number;
  quantity: number;
  subtotalInCents: number;
=======
  isService: boolean;
  unitPriceInCents: number;
  quantity: number;
  subtotalInCents: number;
  // Solo para servicios
  appointmentDate: string | null;
  appointmentTime: string | null;
  durationMinutes: number | null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}

export interface ICreateOrderUC {
  /**
   * Crea una nueva orden
<<<<<<< HEAD
   * Verifica stock de productos
   * Ejecuta todo en una transacción atómica
   *
   * @throws InsufficientStockError si no hay suficiente stock
=======
   * Verifica stock (productos) y disponibilidad (servicios)
   * Ejecuta todo en una transacción atómica
   *
   * @throws InsufficientStockError si no hay suficiente stock
   * @throws SlotNotAvailableError si el slot no está disponible
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
   * @throws ProductNotFoundError si algún producto no existe
   * @throws TenantNotFoundError si el tenant no existe
   */
  execute(command: CreateOrderCommand): Promise<CreatedOrderDTO>;
}

export const CREATE_ORDER_UC = Symbol('ICreateOrderUC');
