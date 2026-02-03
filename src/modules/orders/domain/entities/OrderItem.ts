import { Money } from '../value-objects';

/**
 * Entity: OrderItem
 * Representa un item dentro de una orden (producto o servicio)
 */
export interface OrderItemProps {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productIsService: boolean;
  unitPriceInCents: number;
  quantity: number;
  // Solo para servicios
  appointmentDate?: Date | null;
  appointmentTime?: string | null; // "HH:mm"
  durationMinutes?: number | null;
}

export interface CreateOrderItemInput {
  productId: string;
  productName: string;
  productIsService: boolean;
  unitPriceInCents: number;
  quantity: number;
  appointmentDate?: Date;
  appointmentTime?: string;
  durationMinutes?: number;
}

export class OrderItem {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly productName: string;
  readonly productIsService: boolean;
  readonly unitPriceInCents: number;
  readonly quantity: number;
  readonly appointmentDate: Date | null;
  readonly appointmentTime: string | null;
  readonly durationMinutes: number | null;

  constructor(props: OrderItemProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.productName = props.productName;
    this.productIsService = props.productIsService;
    this.unitPriceInCents = props.unitPriceInCents;
    this.quantity = props.quantity;
    this.appointmentDate = props.appointmentDate ?? null;
    this.appointmentTime = props.appointmentTime ?? null;
    this.durationMinutes = props.durationMinutes ?? null;

    this.validate();
  }

  private validate(): void {
    if (this.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    if (this.unitPriceInCents < 0) {
      throw new Error('Unit price cannot be negative');
    }

    // Si es servicio, debe tener cita
    if (this.productIsService) {
      if (!this.appointmentDate || !this.appointmentTime) {
        throw new Error('Service items must have appointment date and time');
      }
      if (!this.durationMinutes || this.durationMinutes < 1) {
        throw new Error('Service items must have valid duration');
      }
      // Servicios siempre tienen cantidad 1
      if (this.quantity !== 1) {
        throw new Error('Service items must have quantity of 1');
      }
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

  /**
   * Verifica si este item es un servicio con cita
   */
  get hasAppointment(): boolean {
    return (
      this.productIsService &&
      this.appointmentDate !== null &&
      this.appointmentTime !== null
    );
  }

  /**
   * Obtiene la fecha y hora de la cita formateada
   */
  getAppointmentDisplay(): string | null {
    if (!this.hasAppointment) return null;

    const dateStr = this.appointmentDate!.toLocaleDateString('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Costa_Rica',
    });

    return `${dateStr} a las ${this.appointmentTime}`;
  }
}
