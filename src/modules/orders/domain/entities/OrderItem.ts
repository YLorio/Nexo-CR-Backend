import { Money } from '../value-objects';

/**
 * Entity: OrderItem
 * Representa un item dentro de una orden (producto)
 */
export interface OrderItemProps {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
}

export interface CreateOrderItemInput {
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
}

export class OrderItem {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitPriceInCents: number;
  readonly quantity: number;

  constructor(props: OrderItemProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.productName = props.productName;
    this.unitPriceInCents = props.unitPriceInCents;
    this.quantity = props.quantity;

    this.validate();
  }

  private validate(): void {
    if (this.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    if (this.unitPriceInCents < 0) {
      throw new Error('Unit price cannot be negative');
    }
  }

  /**
   * Calcula el subtotal de este item
   */
  get subtotal(): Money {
    return new Money(this.unitPriceInCents).multiply(this.quantity);
  }

  /**
   * Subtotal en centavos
   */
  get subtotalInCents(): number {
    return this.subtotal.amountInCents;
  }
}
