/**
 * Value Object: DayOfWeek
 * Representa un día de la semana con utilidades para conversión
 */
export enum DayOfWeekEnum {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export class DayOfWeek {
  private static readonly JS_DAY_MAP: Record<number, DayOfWeekEnum> = {
    0: DayOfWeekEnum.SUNDAY,
    1: DayOfWeekEnum.MONDAY,
    2: DayOfWeekEnum.TUESDAY,
    3: DayOfWeekEnum.WEDNESDAY,
    4: DayOfWeekEnum.THURSDAY,
    5: DayOfWeekEnum.FRIDAY,
    6: DayOfWeekEnum.SATURDAY,
  };

  private static readonly ENUM_TO_JS_DAY: Record<DayOfWeekEnum, number> = {
    [DayOfWeekEnum.SUNDAY]: 0,
    [DayOfWeekEnum.MONDAY]: 1,
    [DayOfWeekEnum.TUESDAY]: 2,
    [DayOfWeekEnum.WEDNESDAY]: 3,
    [DayOfWeekEnum.THURSDAY]: 4,
    [DayOfWeekEnum.FRIDAY]: 5,
    [DayOfWeekEnum.SATURDAY]: 6,
  };

  constructor(public readonly value: DayOfWeekEnum) {}

  /**
   * Crea un DayOfWeek desde un objeto Date de JavaScript
   * Usa zona horaria de Costa Rica (America/Costa_Rica)
   */
  static fromDate(date: Date): DayOfWeek {
    // Convertir a zona horaria de Costa Rica
    const costaRicaDate = new Date(
      date.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' })
    );
    const jsDay = costaRicaDate.getDay();
    return new DayOfWeek(this.JS_DAY_MAP[jsDay]);
  }

  /**
   * Crea un DayOfWeek desde un string del enum
   */
  static fromString(day: string): DayOfWeek {
    const upperDay = day.toUpperCase() as DayOfWeekEnum;
    if (!Object.values(DayOfWeekEnum).includes(upperDay)) {
      throw new Error(`Invalid day of week: ${day}`);
    }
    return new DayOfWeek(upperDay);
  }

  /**
   * Obtiene el número de día de JavaScript (0 = domingo, 6 = sábado)
   */
  toJsDay(): number {
    return DayOfWeek.ENUM_TO_JS_DAY[this.value];
  }

  /**
   * Obtiene el nombre en español
   */
  toSpanish(): string {
    const names: Record<DayOfWeekEnum, string> = {
      [DayOfWeekEnum.MONDAY]: 'Lunes',
      [DayOfWeekEnum.TUESDAY]: 'Martes',
      [DayOfWeekEnum.WEDNESDAY]: 'Miércoles',
      [DayOfWeekEnum.THURSDAY]: 'Jueves',
      [DayOfWeekEnum.FRIDAY]: 'Viernes',
      [DayOfWeekEnum.SATURDAY]: 'Sábado',
      [DayOfWeekEnum.SUNDAY]: 'Domingo',
    };
    return names[this.value];
  }

  equals(other: DayOfWeek): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
