import { DomainError } from '../../../shared/domain/errors/DomainError';

/**
 * Error cuando la categoría no existe
 */
export class CategoryNotFoundError extends DomainError {
  readonly code = 'CATEGORY_NOT_FOUND';

  constructor(categoryId: string) {
    super(`No se encontró la categoría con ID: ${categoryId}`);
  }
}

/**
 * Error cuando el tenantId es inválido
 */
export class InvalidTenantError extends DomainError {
  readonly code = 'INVALID_TENANT';

  constructor() {
    super('El identificador del negocio es requerido');
  }
}
