/**
 * Base class para errores de dominio
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error cuando no se encuentra un recurso
 */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`);
  }
}

/**
 * Error de validación de datos
 */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error de regla de negocio
 */
export class BusinessRuleError extends DomainError {
  readonly code = 'BUSINESS_RULE_ERROR';

  constructor(message: string) {
    super(message);
  }
}
