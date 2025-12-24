import { PrismaClient } from '@prisma/client';
import {
  ICatalogQueryRepository,
  CatalogFilters,
  CategoryInfo,
  ProductInfo,
} from '../../application/ports/outbound';

/**
 * Implementacion Prisma del repositorio de consultas del Catalogo
 * Adaptado al nuevo schema con InventoryItem + ProductVariant y ServiceDefinition
 */
export class PrismaCatalogQueryRepository implements ICatalogQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProducts(filters: CatalogFilters): Promise<ProductInfo[]> {
    const { tenantId, categoryId, onlyServices, onlyProducts } = filters;
    const results: ProductInfo[] = [];

    // Buscar productos de inventario (InventoryItem + ProductVariant)
    if (!onlyServices) {
      const inventoryItems = await this.prisma.inventoryItem.findMany({
        where: {
          tenantId,
          isActive: true,
          ...(categoryId && { categoryId }),
        },
        include: {
          category: {
            select: { name: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          variants: {
            where: { isDefault: true, isActive: true },
            take: 1,
          },
        },
        orderBy: [{ name: 'asc' }],
      });

      for (const item of inventoryItems) {
        const defaultVariant = item.variants[0];
        if (defaultVariant) {
          results.push({
            id: item.id,
            name: item.name,
            description: item.description,
            imageUrl: item.images[0]?.imageUrl || null,
            priceInCents: defaultVariant.priceInCents,
            isService: false,
            durationMinutes: null,
            stock: defaultVariant.stock,
            categoryId: item.categoryId,
            categoryName: item.category?.name || null,
            sortOrder: 0,
          });
        }
      }
    }

    // Buscar servicios (ServiceDefinition)
    if (!onlyProducts) {
      const services = await this.prisma.serviceDefinition.findMany({
        where: {
          tenantId,
          isActive: true,
          ...(categoryId && { categoryId }),
        },
        include: {
          category: {
            select: { name: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: [{ name: 'asc' }],
      });

      for (const service of services) {
        results.push({
          id: service.id,
          name: service.name,
          description: service.description,
          imageUrl: service.images[0]?.imageUrl || null,
          priceInCents: service.basePriceInCents,
          isService: true,
          durationMinutes: service.durationMinutes,
          stock: 0,
          categoryId: service.categoryId,
          categoryName: service.category?.name || null,
          sortOrder: 0,
        });
      }
    }

    // Ordenar por nombre
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findCategories(tenantId: string): Promise<CategoryInfo[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        tenantId,
        isVisible: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories;
  }

  async categoryExists(tenantId: string, categoryId: string): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        tenantId,
        isVisible: true,
      },
      select: { id: true },
    });

    return category !== null;
  }
}
