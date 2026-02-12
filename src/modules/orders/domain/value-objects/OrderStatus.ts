/**
 * Value Object: OrderStatus
 * Estados posibles de una orden - Sincronizado con Prisma
 */
export enum OrderStatusEnum {
  DRAFT = 'DRAFT',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class OrderStatus {
  constructor(public readonly value: OrderStatusEnum) {}

  static draft(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.DRAFT);
  }

  static awaitingPayment(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.AWAITING_PAYMENT);
  }

  static approved(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.APPROVED);
  }

  static completed(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.COMPLETED);
  }

  static cancelled(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CANCELLED);
  }

  static fromString(status: string): OrderStatus {
    const upperStatus = status.toUpperCase() as OrderStatusEnum;
    if (!Object.values(OrderStatusEnum).includes(upperStatus)) {
      throw new Error(`Invalid order status: ${status}`);
    }
    return new OrderStatus(upperStatus);
  }

  /**
   * Verifica si se puede transicionar a un nuevo estado
   */
  canTransitionTo(newStatus: OrderStatus): boolean {
    const allowedTransitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      [OrderStatusEnum.DRAFT]: [
        OrderStatusEnum.AWAITING_PAYMENT,
        OrderStatusEnum.AWAITING_APPROVAL,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.AWAITING_PAYMENT]: [
        OrderStatusEnum.APPROVED,
        OrderStatusEnum.AWAITING_APPROVAL,
        OrderStatusEnum.DRAFT, // Retroceder
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.AWAITING_APPROVAL]: [
        OrderStatusEnum.APPROVED,
        OrderStatusEnum.REJECTED,
        OrderStatusEnum.DRAFT, // Retroceder
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.APPROVED]: [
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.AWAITING_APPROVAL, // Retroceder (SINPE)
        OrderStatusEnum.AWAITING_PAYMENT, // Retroceder (CASH)
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.PROCESSING]: [
        OrderStatusEnum.READY,
        OrderStatusEnum.APPROVED, // Retroceder
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.READY]: [
        OrderStatusEnum.SHIPPED,
        OrderStatusEnum.COMPLETED,
        OrderStatusEnum.PROCESSING, // Retroceder
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.SHIPPED]: [
        OrderStatusEnum.COMPLETED,
        OrderStatusEnum.READY, // Retroceder
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.REJECTED]: [
        OrderStatusEnum.AWAITING_APPROVAL, // Reenviar a aprobación
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.COMPLETED]: [OrderStatusEnum.REFUNDED],
      [OrderStatusEnum.CANCELLED]: [],
      [OrderStatusEnum.REFUNDED]: [],
    };

    return allowedTransitions[this.value].includes(newStatus.value);
  }

  isAwaitingPayment(): boolean {
    return this.value === OrderStatusEnum.AWAITING_PAYMENT;
  }

  isApproved(): boolean {
    return this.value === OrderStatusEnum.APPROVED;
  }

  isCompleted(): boolean {
    return this.value === OrderStatusEnum.COMPLETED;
  }

  isCancelled(): boolean {
    return this.value === OrderStatusEnum.CANCELLED;
  }

  /**
   * Verifica si la orden puede ser cancelada
   */
  canBeCancelled(): boolean {
    return this.value !== OrderStatusEnum.COMPLETED && 
           this.value !== OrderStatusEnum.CANCELLED && 
           this.value !== OrderStatusEnum.REFUNDED &&
           this.value !== OrderStatusEnum.REJECTED;
  }

  toSpanish(): string {
    const names: Record<OrderStatusEnum, string> = {
      [OrderStatusEnum.DRAFT]: 'Borrador',
      [OrderStatusEnum.AWAITING_PAYMENT]: 'Pendiente de Pago',
      [OrderStatusEnum.AWAITING_APPROVAL]: 'Pendiente de Aprobación',
      [OrderStatusEnum.APPROVED]: 'Aprobado',
      [OrderStatusEnum.REJECTED]: 'Rechazado',
      [OrderStatusEnum.PROCESSING]: 'En Proceso',
      [OrderStatusEnum.READY]: 'Listo',
      [OrderStatusEnum.SHIPPED]: 'Enviado',
      [OrderStatusEnum.COMPLETED]: 'Completado',
      [OrderStatusEnum.CANCELLED]: 'Cancelado',
      [OrderStatusEnum.REFUNDED]: 'Reembolsado',
    };
    return names[this.value];
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
