import { DomainError } from '../../../shared/domain/errors/DomainError';

/**
 * Error cuando el servicio solicitado no existe
 */
export class ServiceNotFoundError extends DomainError {
  readonly code = 'SERVICE_NOT_FOUND';

  constructor(serviceId: string) {
    super(`Service not found: ${serviceId}`);
  }
}

/**
 * Error cuando no hay disponibilidad configurada para el tenant
 */
export class NoAvailabilityConfiguredError extends DomainError {
  readonly code = 'NO_AVAILABILITY_CONFIGURED';

  constructor(tenantId: string, dayOfWeek: string) {
    super(`No availability configured for tenant ${tenantId} on ${dayOfWeek}`);
  }
}

/**
 * Error cuando el slot solicitado no está disponible
 */
export class SlotNotAvailableError extends DomainError {
  readonly code = 'SLOT_NOT_AVAILABLE';

  constructor(date: string, time: string) {
    super(`Slot not available at ${date} ${time}`);
  }
}

/**
 * Error cuando la fecha es inválida (pasada)
 */
export class InvalidDateError extends DomainError {
  readonly code = 'INVALID_DATE';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error cuando no hay empleados asignados a un servicio
 */
export class NoEmployeesForServiceError extends DomainError {
  readonly code = 'NO_EMPLOYEES_FOR_SERVICE';

  constructor(serviceId: string) {
    super(`No employees assigned to service: ${serviceId}`);
  }
}

/**
 * Error cuando el empleado no está disponible
 */
export class EmployeeNotAvailableError extends DomainError {
  readonly code = 'EMPLOYEE_NOT_AVAILABLE';

  constructor(employeeId: string, date: string, time: string) {
    super(`Employee ${employeeId} is not available at ${date} ${time}`);
  }
}
