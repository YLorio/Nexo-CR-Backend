/**
 * Puerto de salida: Unit of Work
 * Abstrae las transacciones de base de datos
 */
export interface IUnitOfWork {
  /**
   * Ejecuta una operación dentro de una transacción
   * Si la operación lanza una excepción, la transacción se revierte automáticamente
   */
  executeInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}

export const UNIT_OF_WORK = Symbol('IUnitOfWork');
