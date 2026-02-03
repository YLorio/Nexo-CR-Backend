import { CategoryInfo, ProductInfo } from '../outbound/ICatalogQueryRepository';

/**
 * Respuesta del catálogo
 */
export interface CatalogResponse {
  categories: CategoryInfo[];
  products: ProductInfo[];
  totalProducts: number;
  filters: {
    tenantId: string;
    categoryId: string | null;
  };
}

/**
 * Parámetros de entrada para obtener el catálogo
 */
export interface GetCatalogQuery {
  tenantId: string;
  categoryId?: string;
}

/**
 * Puerto de entrada para obtener el catálogo de productos
 */
export interface IGetCatalogUC {
  execute(query: GetCatalogQuery): Promise<CatalogResponse>;
}

export const GET_CATALOG_UC = Symbol('IGetCatalogUC');
