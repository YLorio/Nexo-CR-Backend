import { DomainError } from '../../../shared/domain/errors/DomainError';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Email o contraseña incorrectos');
  }
}

export class UserInactiveError extends DomainError {
  readonly code = 'USER_INACTIVE';

  constructor() {
    super('Esta cuenta está desactivada');
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'No autorizado') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';

  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message);
  }
}
