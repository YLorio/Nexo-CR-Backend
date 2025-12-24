import { DomainError } from '../../../shared/domain/errors/DomainError';

/**
 * Error cuando el tenant no existe
 */
export class TenantNotFoundError extends DomainError {
  readonly code = 'TENANT_NOT_FOUND';

  constructor(slug: string) {
    super(`No se encontró el negocio con identificador: ${slug}`);
  }
}

/**
 * Error cuando el tenant está inactivo
 */
export class TenantInactiveError extends DomainError {
  readonly code = 'TENANT_INACTIVE';

  constructor(slug: string) {
    super(`El negocio "${slug}" no está disponible actualmente`);
  }
}
