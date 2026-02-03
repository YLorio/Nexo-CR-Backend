import { DomainError } from '../../../shared/domain/errors/DomainError';

/**
 * Error cuando no hay suficiente stock de un producto
 */
export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(
      `Insufficient stock for "${productName}": requested ${requested}, available ${available}`,
    );
  }
}

/**
<<<<<<< HEAD
=======
 * Error cuando el slot de cita no está disponible
 */
export class SlotNotAvailableError extends DomainError {
  readonly code = 'SLOT_NOT_AVAILABLE';

  constructor(
    public readonly serviceName: string,
    public readonly date: string,
    public readonly time: string,
  ) {
    super(`Slot not available for "${serviceName}" at ${date} ${time}`);
  }
}

/**
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 * Error cuando el producto no existe
 */
export class ProductNotFoundError extends DomainError {
  readonly code = 'PRODUCT_NOT_FOUND';

  constructor(productId: string) {
    super(`Product not found: ${productId}`);
  }
}

/**
 * Error cuando la orden no existe
 */
export class OrderNotFoundError extends DomainError {
  readonly code = 'ORDER_NOT_FOUND';

  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
  }
}

/**
 * Error cuando la transición de estado no es válida
 */
export class InvalidOrderStatusTransitionError extends DomainError {
  readonly code = 'INVALID_STATUS_TRANSITION';

  constructor(currentStatus: string, targetStatus: string) {
    super(`Cannot transition from ${currentStatus} to ${targetStatus}`);
  }
}

/**
 * Error cuando el tenant no existe
 */
export class TenantNotFoundError extends DomainError {
  readonly code = 'TENANT_NOT_FOUND';

  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`);
  }
}

/**
 * Error genérico de creación de orden
 */
export class OrderCreationError extends DomainError {
  readonly code = 'ORDER_CREATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}
