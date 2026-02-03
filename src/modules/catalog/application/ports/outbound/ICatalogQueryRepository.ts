/**
 * Puerto de salida para consultas del Catálogo
 * Define las operaciones de lectura necesarias para productos y categorías
 */

export interface CategoryInfo {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface ProductInfo {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
<<<<<<< HEAD
  imageUrls: string[];
  priceInCents: number;
=======
  priceInCents: number;
  isService: boolean;
  durationMinutes: number | null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  stock: number;
  categoryId: string | null;
  categoryName: string | null;
  sortOrder: number;
}

export interface CatalogFilters {
  tenantId: string;
  categoryId?: string;
<<<<<<< HEAD
=======
  onlyServices?: boolean;
  onlyProducts?: boolean;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}

export interface ICatalogQueryRepository {
  /**
   * Obtiene todos los productos activos de un tenant
   * Opcionalmente filtrados por categoría
   */
  findProducts(filters: CatalogFilters): Promise<ProductInfo[]>;

  /**
   * Obtiene todas las categorías activas de un tenant
   */
  findCategories(tenantId: string): Promise<CategoryInfo[]>;

  /**
   * Verifica si una categoría existe y pertenece al tenant
   */
  categoryExists(tenantId: string, categoryId: string): Promise<boolean>;
}
