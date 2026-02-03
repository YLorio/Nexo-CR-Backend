import { PrismaClient } from '@prisma/client';
import { IProductRepository, ProductInfo } from '../../application/ports/outbound';
import { BaseRepository } from './BaseRepository';

/**
 * Implementación Prisma del repositorio de productos para el módulo Orders
 * Usa Producto + VarianteProducto para productos
 */
export class PrismaProductRepository extends BaseRepository implements IProductRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(productId: string): Promise<ProductInfo | null> {
    const client = this.getClient();

    // Buscar como variante de producto
    const variante = await client.varianteProducto.findUnique({
      where: { id: productId },
      include: {
        producto: true,
      },
    });

    if (variante && !variante.eliminadoEn && variante.producto && !variante.producto.eliminadoEn) {
      return {
        id: variante.id,
        tenantId: variante.producto.negocioId,
        name: variante.producto.nombre,
        priceInCents: variante.precioEnCents,
        stock: variante.stock,
        isActive: variante.activo && variante.producto.activo,
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

    await client.varianteProducto.update({
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

    await client.varianteProducto.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }
}
