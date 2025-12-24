/**
 * Value Object: Money
 * Representa un valor monetario en centavos para evitar problemas de punto flotante
 */
export class Money {
  constructor(
    public readonly amountInCents: number,
    public readonly currency: string = 'CRC', // Colones costarricenses
  ) {
    if (!Number.isInteger(amountInCents)) {
      throw new Error('Amount must be an integer (cents)');
    }
    if (amountInCents < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  /**
   * Crea un Money desde un valor en unidades (ej: 15000 colones)
   */
  static fromUnits(amount: number, currency: string = 'CRC'): Money {
    return new Money(Math.round(amount * 100), currency);
  }

  /**
   * Crea un Money de cero
   */
  static zero(currency: string = 'CRC'): Money {
    return new Money(0, currency);
  }

  /**
   * Obtiene el valor en unidades (ej: 15000.00)
   */
  toUnits(): number {
    return this.amountInCents / 100;
  }

  /**
   * Suma dos valores monetarios
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amountInCents + other.amountInCents, this.currency);
  }

  /**
   * Multiplica por una cantidad (para calcular subtotales)
   */
  multiply(quantity: number): Money {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    return new Money(Math.round(this.amountInCents * quantity), this.currency);
  }

  /**
   * Resta un valor monetario
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amountInCents - other.amountInCents;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(result, this.currency);
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }

  /**
   * Formatea el valor para mostrar (ej: "₡15,000.00")
   */
  format(): string {
    const formatted = this.toUnits().toLocaleString('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const symbols: Record<string, string> = {
      CRC: '₡',
      USD: '$',
    };

    const symbol = symbols[this.currency] || this.currency;
    return `${symbol}${formatted}`;
  }

  equals(other: Money): boolean {
    return (
      this.amountInCents === other.amountInCents &&
      this.currency === other.currency
    );
  }

  toString(): string {
    return this.format();
  }
}
