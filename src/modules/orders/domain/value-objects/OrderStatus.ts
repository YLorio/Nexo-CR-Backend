/**
 * Value Object: OrderStatus
<<<<<<< HEAD
 * Estados posibles de una orden (debe coincidir con el enum de Prisma)
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
=======
 * Estados posibles de una orden
 */
export enum OrderStatusEnum {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}

export class OrderStatus {
  constructor(public readonly value: OrderStatusEnum) {}

<<<<<<< HEAD
  static awaitingPayment(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.AWAITING_PAYMENT);
  }

  static awaitingApproval(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.AWAITING_APPROVAL);
  }

  static approved(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.APPROVED);
  }

  static processing(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PROCESSING);
  }

  static ready(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.READY);
=======
  static pendingPayment(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PENDING_PAYMENT);
  }

  static paid(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PAID);
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
      [OrderStatusEnum.DRAFT]: [
        OrderStatusEnum.AWAITING_PAYMENT,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.AWAITING_PAYMENT]: [
        OrderStatusEnum.AWAITING_APPROVAL,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.AWAITING_APPROVAL]: [
        OrderStatusEnum.APPROVED,
        OrderStatusEnum.REJECTED,
      ],
      [OrderStatusEnum.APPROVED]: [
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.REJECTED]: [
        OrderStatusEnum.AWAITING_PAYMENT,
      ],
      [OrderStatusEnum.PROCESSING]: [
        OrderStatusEnum.READY,
        OrderStatusEnum.SHIPPED,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.READY]: [
        OrderStatusEnum.COMPLETED,
        OrderStatusEnum.SHIPPED,
      ],
      [OrderStatusEnum.SHIPPED]: [
        OrderStatusEnum.COMPLETED,
      ],
      [OrderStatusEnum.COMPLETED]: [OrderStatusEnum.REFUNDED],
      [OrderStatusEnum.CANCELLED]: [],
      [OrderStatusEnum.REFUNDED]: [],
    };

    return allowedTransitions[this.value]?.includes(newStatus.value) ?? false;
  }

  isAwaitingPayment(): boolean {
    return this.value === OrderStatusEnum.AWAITING_PAYMENT;
  }

  isAwaitingApproval(): boolean {
    return this.value === OrderStatusEnum.AWAITING_APPROVAL;
  }

  isApproved(): boolean {
    return this.value === OrderStatusEnum.APPROVED;
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
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
=======
      [OrderStatusEnum.PENDING_PAYMENT]: 'Pendiente de Pago',
      [OrderStatusEnum.PAID]: 'Pagado',
      [OrderStatusEnum.COMPLETED]: 'Completado',
      [OrderStatusEnum.CANCELLED]: 'Cancelado',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
