import { PrismaClient } from '@prisma/client';
import { TransactionContext, TransactionClient } from './PrismaUnitOfWork';

/**
 * Clase base para repositorios que soportan transacciones
 * Automáticamente usa el cliente de transacción si está disponible
 */
export abstract class BaseRepository {
  constructor(protected readonly prisma: PrismaClient) {}

  /**
   * Obtiene el cliente a usar (transacción o prisma normal)
   */
  protected getClient(): PrismaClient | TransactionClient {
    const tx = TransactionContext.get();
    return tx ?? this.prisma;
  }
}
