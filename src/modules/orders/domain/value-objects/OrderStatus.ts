/**
 * Value Object: OrderStatus
 * Estados posibles de una orden
 */
export enum OrderStatusEnum {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class OrderStatus {
  constructor(public readonly value: OrderStatusEnum) {}

  static pendingPayment(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PENDING_PAYMENT);
  }

  static paid(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PAID);
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
      [OrderStatusEnum.PENDING_PAYMENT]: [
        OrderStatusEnum.PAID,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.PAID]: [
        OrderStatusEnum.COMPLETED,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.COMPLETED]: [],
      [OrderStatusEnum.CANCELLED]: [],
    };

    return allowedTransitions[this.value].includes(newStatus.value);
  }

  isPendingPayment(): boolean {
    return this.value === OrderStatusEnum.PENDING_PAYMENT;
  }

  isPaid(): boolean {
    return this.value === OrderStatusEnum.PAID;
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
    return this.canTransitionTo(OrderStatus.cancelled());
  }

  toSpanish(): string {
    const names: Record<OrderStatusEnum, string> = {
      [OrderStatusEnum.PENDING_PAYMENT]: 'Pendiente de Pago',
      [OrderStatusEnum.PAID]: 'Pagado',
      [OrderStatusEnum.COMPLETED]: 'Completado',
      [OrderStatusEnum.CANCELLED]: 'Cancelado',
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
