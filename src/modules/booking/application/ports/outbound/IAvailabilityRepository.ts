import { AvailabilityBlock } from '../../../domain/entities';
import { DayOfWeekEnum } from '../../../domain/value-objects';

/**
 * Puerto de salida: Repositorio de disponibilidad
 * Interface que define cómo el dominio accede a los datos de disponibilidad
 */
export interface IAvailabilityRepository {
  /**
   * Obtiene los bloques de disponibilidad activos de un tenant para un día específico
   */
  findByTenantAndDay(
    tenantId: string,
    dayOfWeek: DayOfWeekEnum,
  ): Promise<AvailabilityBlock[]>;

  /**
   * Obtiene todos los bloques de disponibilidad de un tenant
   */
  findAllByTenant(tenantId: string): Promise<AvailabilityBlock[]>;

  /**
   * Obtiene un bloque por su ID
   */
  findById(id: string): Promise<AvailabilityBlock | null>;
}

export const AVAILABILITY_REPOSITORY = Symbol('IAvailabilityRepository');
