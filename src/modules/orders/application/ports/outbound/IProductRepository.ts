/**
 * Puerto de salida: Repositorio de productos para el módulo Orders
 */
export interface ProductInfo {
  id: string;
  tenantId: string;
  name: string;
  priceInCents: number;
<<<<<<< HEAD
  stock: number;
=======
  isService: boolean;
  stock: number;
  durationMinutes: number | null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  isActive: boolean;
}

export interface IProductRepository {
  /**
   * Busca un producto por ID
   */
  findById(productId: string): Promise<ProductInfo | null>;

  /**
   * Busca múltiples productos por IDs
   */
  findByIds(productIds: string[]): Promise<ProductInfo[]>;

  /**
<<<<<<< HEAD
   * Decrementa el stock de un producto
=======
   * Decrementa el stock de un producto (para productos físicos)
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
   * Se ejecuta dentro de una transacción
   */
  decrementStock(productId: string, quantity: number): Promise<void>;

  /**
   * Incrementa el stock de un producto (para reversiones)
   * Se ejecuta dentro de una transacción
   */
  incrementStock(productId: string, quantity: number): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
