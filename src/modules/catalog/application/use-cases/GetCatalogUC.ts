import {
  IGetCatalogUC,
  GetCatalogQuery,
  CatalogResponse,
} from '../ports/inbound';
import { ICatalogQueryRepository } from '../ports/outbound';
import { CategoryNotFoundError, InvalidTenantError } from '../../domain/errors';

/**
 * Caso de uso: Obtener catálogo de productos y servicios
 *
 * Retorna la lista de productos/servicios activos de un tenant,
 * opcionalmente filtrados por categoría.
 */
export class GetCatalogUC implements IGetCatalogUC {
  constructor(private readonly catalogQueryRepo: ICatalogQueryRepository) {}

  async execute(query: GetCatalogQuery): Promise<CatalogResponse> {
    const { tenantId, categoryId } = query;

    // Validar que tenantId existe
    if (!tenantId || tenantId.trim() === '') {
      throw new InvalidTenantError();
    }

    // Si se especifica categoría, verificar que existe
    if (categoryId) {
      const categoryExists = await this.catalogQueryRepo.categoryExists(
        tenantId,
        categoryId,
      );
      if (!categoryExists) {
        throw new CategoryNotFoundError(categoryId);
      }
    }

    // Obtener categorías y productos en paralelo
    const [categories, products] = await Promise.all([
      this.catalogQueryRepo.findCategories(tenantId),
      this.catalogQueryRepo.findProducts({
        tenantId,
        categoryId,
      }),
    ]);

    return {
      categories,
      products,
      totalProducts: products.length,
      filters: {
        tenantId,
        categoryId: categoryId || null,
      },
    };
  }
}
