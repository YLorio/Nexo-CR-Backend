import { Money } from '../value-objects';

/**
 * Entity: OrderItem
<<<<<<< HEAD
 * Representa un item dentro de una orden (producto)
=======
 * Representa un item dentro de una orden (producto o servicio)
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 */
export interface OrderItemProps {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
<<<<<<< HEAD
  unitPriceInCents: number;
  quantity: number;
=======
  productIsService: boolean;
  unitPriceInCents: number;
  quantity: number;
  // Solo para servicios
  appointmentDate?: Date | null;
  appointmentTime?: string | null; // "HH:mm"
  durationMinutes?: number | null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}

export interface CreateOrderItemInput {
  productId: string;
  productName: string;
<<<<<<< HEAD
  unitPriceInCents: number;
  quantity: number;
=======
  productIsService: boolean;
  unitPriceInCents: number;
  quantity: number;
  appointmentDate?: Date;
  appointmentTime?: string;
  durationMinutes?: number;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}

export class OrderItem {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly productName: string;
<<<<<<< HEAD
  readonly unitPriceInCents: number;
  readonly quantity: number;
=======
  readonly productIsService: boolean;
  readonly unitPriceInCents: number;
  readonly quantity: number;
  readonly appointmentDate: Date | null;
  readonly appointmentTime: string | null;
  readonly durationMinutes: number | null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

  constructor(props: OrderItemProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.productName = props.productName;
<<<<<<< HEAD
    this.unitPriceInCents = props.unitPriceInCents;
    this.quantity = props.quantity;
=======
    this.productIsService = props.productIsService;
    this.unitPriceInCents = props.unitPriceInCents;
    this.quantity = props.quantity;
    this.appointmentDate = props.appointmentDate ?? null;
    this.appointmentTime = props.appointmentTime ?? null;
    this.durationMinutes = props.durationMinutes ?? null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

    this.validate();
  }

  private validate(): void {
    if (this.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    if (this.unitPriceInCents < 0) {
      throw new Error('Unit price cannot be negative');
    }
<<<<<<< HEAD
=======

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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
=======

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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}
