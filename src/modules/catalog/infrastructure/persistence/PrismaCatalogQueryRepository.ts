import { PrismaClient } from '@prisma/client';
import {
  ICatalogQueryRepository,
  CatalogFilters,
  CategoryInfo,
  ProductInfo,
} from '../../application/ports/outbound';

/**
 * Implementacion Prisma del repositorio de consultas del Catalogo
 * Adaptado al schema con Producto + VarianteProducto
 */
export class PrismaCatalogQueryRepository implements ICatalogQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProducts(filters: CatalogFilters): Promise<ProductInfo[]> {
    const { tenantId, categoryId } = filters;

    const productos = await this.prisma.producto.findMany({
      where: {
        negocioId: tenantId,
        activo: true,
        eliminadoEn: null,
        ...(categoryId && { categoriaId: categoryId }),
      },
      include: {
        categoria: {
          select: { nombre: true },
        },
        imagenes: {
          orderBy: [{ esPrincipal: 'desc' }, { orden: 'asc' }],
          take: 3,
        },
        variantes: {
          where: { esPredeterminado: true, activo: true, eliminadoEn: null },
          take: 1,
        },
      },
      orderBy: [{ nombre: 'asc' }],
    });

    const results: ProductInfo[] = [];

    for (const producto of productos) {
      const variantePredeterminada = producto.variantes[0];
      if (variantePredeterminada) {
        const allImageUrls = producto.imagenes.map((img) => img.urlImagen);
        results.push({
          // Usar el ID de la variante para que el sistema de pedidos pueda encontrarlo
          id: variantePredeterminada.id,
          name: producto.nombre,
          description: producto.descripcion,
          imageUrl: allImageUrls[0] || null,
          imageUrls: allImageUrls,
          priceInCents: variantePredeterminada.precioEnCents,
          stock: variantePredeterminada.stock,
          categoryId: producto.categoriaId,
          categoryName: producto.categoria?.nombre || null,
          sortOrder: 0,
        });
      }
    }

    return results;
  }

  async findCategories(tenantId: string): Promise<CategoryInfo[]> {
    const categorias = await this.prisma.categoria.findMany({
      where: {
        negocioId: tenantId,
        visible: true,
        eliminadoEn: null,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        urlImagen: true,
        orden: true,
      },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });

    // Mapear a la interface esperada
    return categorias.map(cat => ({
      id: cat.id,
      name: cat.nombre,
      description: cat.descripcion,
      imageUrl: cat.urlImagen,
      sortOrder: cat.orden,
    }));
  }

  async categoryExists(tenantId: string, categoryId: string): Promise<boolean> {
    const categoria = await this.prisma.categoria.findFirst({
      where: {
        id: categoryId,
        negocioId: tenantId,
        visible: true,
        eliminadoEn: null,
      },
      select: { id: true },
    });

    return categoria !== null;
  }
}
