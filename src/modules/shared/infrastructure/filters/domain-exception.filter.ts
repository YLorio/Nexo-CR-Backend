import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../domain/errors/DomainError';

/**
 * Mapeo de códigos de error de dominio a códigos HTTP
 */
const errorCodeToHttpStatus: Record<string, HttpStatus> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  BUSINESS_RULE_ERROR: HttpStatus.CONFLICT,
  SERVICE_NOT_FOUND: HttpStatus.NOT_FOUND,
  NO_AVAILABILITY_CONFIGURED: HttpStatus.NOT_FOUND,
  SLOT_NOT_AVAILABLE: HttpStatus.CONFLICT,
  INVALID_DATE: HttpStatus.BAD_REQUEST,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
  ORDER_NOT_FOUND: HttpStatus.NOT_FOUND,
  INVALID_STATUS_TRANSITION: HttpStatus.CONFLICT,
  TENANT_NOT_FOUND: HttpStatus.NOT_FOUND,
  ORDER_CREATION_ERROR: HttpStatus.BAD_REQUEST,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
};

/**
 * Filtro de excepciones para errores de dominio
 * Convierte DomainError en respuestas HTTP apropiadas
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = errorCodeToHttpStatus[exception.code] || HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
