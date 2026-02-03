import { OrderStatus, OrderStatusEnum, Money } from '../value-objects';
import { OrderItem } from './OrderItem';

export type PaymentMethodType = 'SINPE_MOVIL' | 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

/**
 * Entity: Order
 * Agregado raíz para pedidos
 */
export interface OrderProps {
  id: string;
  tenantId: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  status: OrderStatusEnum;
  paymentMethod?: PaymentMethodType;
  customerNotes?: string | null;
  internalNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  items: OrderItem[];
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export class Order {
  readonly id: string;
  readonly tenantId: string;
  readonly orderNumber: number;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly customerEmail: string | null;
  private _status: OrderStatus;
  readonly paymentMethod: PaymentMethodType;
  readonly customerNotes: string | null;
  private _internalNotes: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;
  private _paidAt: Date | null;
  private _completedAt: Date | null;
  private _cancelledAt: Date | null;
  private readonly _items: OrderItem[];

  constructor(props: OrderProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.orderNumber = props.orderNumber;
    this.customerName = props.customerName;
    this.customerPhone = props.customerPhone;
    this.customerEmail = props.customerEmail ?? null;
    this._status = new OrderStatus(props.status);
    this.paymentMethod = props.paymentMethod ?? 'SINPE_MOVIL';
    this.customerNotes = props.customerNotes ?? null;
    this._internalNotes = props.internalNotes ?? null;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._paidAt = props.paidAt ?? null;
    this._completedAt = props.completedAt ?? null;
    this._cancelledAt = props.cancelledAt ?? null;
    this._items = props.items;

    this.validate();
  }

  private validate(): void {
    if (!this.customerName.trim()) {
      throw new Error('Customer name is required');
    }
    if (!this.customerPhone.trim()) {
      throw new Error('Customer phone is required');
    }
    if (this._items.length === 0) {
      throw new Error('Order must have at least one item');
    }
  }

  // Getters
  get status(): OrderStatus {
    return this._status;
  }

  get internalNotes(): string | null {
    return this._internalNotes;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get paidAt(): Date | null {
    return this._paidAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get cancelledAt(): Date | null {
    return this._cancelledAt;
  }

  get items(): readonly OrderItem[] {
    return [...this._items];
  }

  /**
   * Calcula el subtotal de la orden
   */
  get subtotal(): Money {
    return this._items.reduce(
      (acc, item) => acc.add(item.subtotal),
      Money.zero(),
    );
  }

  /**
   * Por ahora total = subtotal (sin descuentos ni impuestos)
   */
  get total(): Money {
    return this.subtotal;
  }

  get subtotalInCents(): number {
    return this.subtotal.amountInCents;
  }

  get totalInCents(): number {
    return this.total.amountInCents;
  }

  /**
   * Marca la orden como aprobada (pago confirmado)
   */
  markAsApproved(): void {
    if (!this._status.canTransitionTo(OrderStatus.approved())) {
      throw new Error(`Cannot mark order as approved from status: ${this._status.value}`);
    }
    this._status = OrderStatus.approved();
    this._paidAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Marca la orden como completada
   */
  markAsCompleted(): void {
    if (!this._status.canTransitionTo(OrderStatus.completed())) {
      throw new Error(`Cannot mark order as completed from status: ${this._status.value}`);
    }
    this._status = OrderStatus.completed();
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Cancela la orden
   */
  cancel(): void {
    if (!this._status.canBeCancelled()) {
      throw new Error(`Cannot cancel order with status: ${this._status.value}`);
    }
    this._status = OrderStatus.cancelled();
    this._cancelledAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Agrega una nota interna
   */
  addInternalNote(note: string): void {
    this._internalNotes = this._internalNotes
      ? `${this._internalNotes}\n${note}`
      : note;
    this._updatedAt = new Date();
  }

  /**
   * Genera un identificador legible para el cliente
   */
  getDisplayId(): string {
    return `#${this.orderNumber.toString().padStart(4, '0')}`;
  }
}
