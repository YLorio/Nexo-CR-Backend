import { PrismaClient } from '@prisma/client';
import {
  ICatalogQueryRepository,
  CatalogFilters,
  CategoryInfo,
  ProductInfo,
} from '../../application/ports/outbound';

/**
 * Implementacion Prisma del repositorio de consultas del Catalogo
<<<<<<< HEAD
 * Adaptado al schema con Producto + VarianteProducto
=======
 * Adaptado al nuevo schema con InventoryItem + ProductVariant y ServiceDefinition
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 */
export class PrismaCatalogQueryRepository implements ICatalogQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProducts(filters: CatalogFilters): Promise<ProductInfo[]> {
<<<<<<< HEAD
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
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
          sortOrder: 0,
        });
      }
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      },
      select: { id: true },
    });

<<<<<<< HEAD
    return categoria !== null;
=======
    return category !== null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  }
}
