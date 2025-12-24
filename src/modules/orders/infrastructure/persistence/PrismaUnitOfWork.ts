import { PrismaClient, Prisma } from '@prisma/client';
import { IUnitOfWork } from '../../application/ports/outbound';

/**
 * Tipo para el cliente de transacción de Prisma
 */
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Contexto de transacción compartido entre repositorios
 * Permite que múltiples repositorios participen en la misma transacción
 */
export class TransactionContext {
  private static currentTransaction: TransactionClient | null = null;

  static get(): TransactionClient | null {
    return this.currentTransaction;
  }

  static set(tx: TransactionClient | null): void {
    this.currentTransaction = tx;
  }
}

/**
 * Implementación del Unit of Work usando Prisma Interactive Transactions
 */
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(
      async (tx) => {
        // Establecer el contexto de transacción para que los repositorios lo usen
        TransactionContext.set(tx);

        try {
          const result = await operation();
          return result;
        } finally {
          // Limpiar el contexto al finalizar
          TransactionContext.set(null);
        }
      },
      {
        // Configuración de la transacción
        maxWait: 5000, // Máximo tiempo de espera para obtener conexión
        timeout: 30000, // Timeout de la transacción (30 segundos)
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
  }
}
