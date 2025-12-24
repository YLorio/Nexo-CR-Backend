import { DayOfWeekEnum } from '../../../domain/value-objects';

/**
 * Información básica de un empleado
 */
export interface EmployeeInfo {
  id: string;
  name: string;
  photoUrl: string | null;
  isActive: boolean;
}

/**
 * Empleado con sus bloques de disponibilidad
 */
export interface EmployeeWithAvailability extends EmployeeInfo {
  availabilityBlocks: {
    id: string;
    dayOfWeek: DayOfWeekEnum;
    startTime: string;
    endTime: string;
    capacity: number;
    isActive: boolean;
  }[];
}

/**
 * Puerto de salida: Repositorio de empleados
 * Interface que define cómo el dominio accede a los datos de empleados
 */
export interface IEmployeeRepository {
  /**
   * Obtiene los empleados activos que pueden realizar un servicio específico
   */
  findEmployeesForService(
    tenantId: string,
    serviceId: string,
  ): Promise<EmployeeInfo[]>;

  /**
   * Obtiene los empleados con sus bloques de disponibilidad para un día específico
   */
  findEmployeesWithAvailabilityForDay(
    tenantId: string,
    serviceId: string,
    dayOfWeek: DayOfWeekEnum,
  ): Promise<EmployeeWithAvailability[]>;

  /**
   * Obtiene un empleado por su ID
   */
  findById(id: string): Promise<EmployeeInfo | null>;

  /**
   * Obtiene todos los empleados activos de un tenant
   */
  findAllByTenant(tenantId: string): Promise<EmployeeInfo[]>;
}

export const EMPLOYEE_REPOSITORY = Symbol('IEmployeeRepository');
