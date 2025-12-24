import { PrismaClient } from '@prisma/client';
import { IProductRepository, ProductInfo } from '../../application/ports/outbound';
import { BaseRepository } from './BaseRepository';

/**
 * Implementación Prisma del repositorio de productos para el módulo Orders
 * Usa InventoryItem + ProductVariant para productos y ServiceDefinition para servicios
 */
export class PrismaProductRepository extends BaseRepository implements IProductRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(productId: string): Promise<ProductInfo | null> {
    const client = this.getClient();

    // Primero intentar como servicio
    const service = await client.serviceDefinition.findUnique({
      where: { id: productId },
    });

    if (service && !service.deletedAt) {
      return {
        id: service.id,
        tenantId: service.tenantId,
        name: service.name,
        priceInCents: service.basePriceInCents,
        isService: true,
        stock: 0, // Servicios no tienen stock
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
      };
    }

    // Luego intentar como variante de producto
    const variant = await client.productVariant.findUnique({
      where: { id: productId },
      include: {
        inventoryItem: true,
      },
    });

    if (variant && !variant.deletedAt && variant.inventoryItem && !variant.inventoryItem.deletedAt) {
      return {
        id: variant.id,
        tenantId: variant.inventoryItem.tenantId,
        name: variant.inventoryItem.name,
        priceInCents: variant.priceInCents,
        isService: false,
        stock: variant.stock,
        durationMinutes: null,
        isActive: variant.isActive && variant.inventoryItem.isActive,
      };
    }

    return null;
  }

  async findByIds(productIds: string[]): Promise<ProductInfo[]> {
    const results: ProductInfo[] = [];

    for (const id of productIds) {
      const product = await this.findById(id);
      if (product) {
        results.push(product);
      }
    }

    return results;
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const client = this.getClient();

    // Solo aplica a variantes de productos (no servicios)
    await client.productVariant.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async incrementStock(productId: string, quantity: number): Promise<void> {
    const client = this.getClient();

    await client.productVariant.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }
}
