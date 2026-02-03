import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
  ListCatalogQueryDto,
  CatalogItemResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
  CategoryNodeResponseDto,
} from '../infrastructure/http/dto';

interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  imageUrl: string | null;
  imageUrls: string[];
  categoryId: string | null;
  categoryName: string | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todos los productos del catálogo del negocio
   * SEGURIDAD: Filtra SIEMPRE por negocioId del JWT
   */
  async listItems(
    tenantId: string,
    query: ListCatalogQueryDto,
  ): Promise<CatalogItemResponseDto[]> {
    const productoWhere: any = {
      negocioId: tenantId,
      eliminadoEn: null,
    };

    if (query.categoryId) {
      productoWhere.categoriaId = query.categoryId;
    }

    if (query.isActive !== undefined) {
      productoWhere.activo = query.isActive;
    }

    if (query.search) {
      productoWhere.nombre = { contains: query.search };
    }

    const productos = await this.prisma.producto.findMany({
      where: productoWhere,
      include: {
        categoria: { select: { nombre: true } },
        variantes: {
          where: { esPredeterminado: true, eliminadoEn: null },
          take: 1,
        },
        imagenes: {
          orderBy: { orden: 'asc' },
          take: 3,
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return productos.map((producto) => {
      const variantePredeterminada = producto.variantes[0];
      const imageUrls = producto.imagenes.map((img) => img.urlImagen);
      const primaryImage = producto.imagenes.find((img) => img.esPrincipal)?.urlImagen || imageUrls[0] || null;

      return {
        id: producto.id,
        name: producto.nombre,
        description: producto.descripcion,
        priceInCents: variantePredeterminada?.precioEnCents ?? 0,
        imageUrl: primaryImage,
        imageUrls,
        categoryId: producto.categoriaId,
        categoryName: producto.categoria?.nombre || null,
        stock: variantePredeterminada?.stock ?? 0,
        sku: variantePredeterminada?.sku ?? null,
        isActive: producto.activo,
        sortOrder: 0,
        createdAt: producto.creadoEn,
        updatedAt: producto.actualizadoEn,
      };
    });
  }

  /**
   * Crea un nuevo producto en el catálogo
   * SEGURIDAD: Asigna el negocioId del JWT al nuevo item
   */
  async createItem(
    tenantId: string,
    dto: CreateCatalogItemDto,
  ): Promise<CatalogItemResponseDto> {
    // Validar que la categoría pertenece al negocio (si se especifica)
    if (dto.categoryId) {
      const categoria = await this.prisma.categoria.findFirst({
        where: {
          id: dto.categoryId,
          negocioId: tenantId,
          eliminadoEn: null,
        },
      });

      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    const slug = this.generateSlug(dto.name);

    const producto = await this.prisma.producto.create({
      data: {
        negocioId: tenantId,
        nombre: dto.name,
        slug,
        descripcion: dto.description,
        categoriaId: dto.categoryId,
        activo: true,
        imagenes: dto.imageUrls && dto.imageUrls.length > 0
          ? {
              create: dto.imageUrls.map((url, index) => ({
                urlImagen: url,
                orden: index,
                esPrincipal: index === 0,
              })),
            }
          : dto.imageUrl
          ? {
              create: {
                urlImagen: dto.imageUrl,
                orden: 0,
                esPrincipal: true,
              },
            }
          : undefined,
        variantes: {
          create: {
            sku: dto.sku || `SKU-${Date.now()}`,
            precioEnCents: dto.priceInCents,
            stock: dto.stock ?? 0,
            esPredeterminado: true,
            activo: true,
          },
        },
      },
      include: {
        categoria: { select: { nombre: true } },
        imagenes: { orderBy: { orden: 'asc' } },
        variantes: { where: { esPredeterminado: true } },
      },
    });

    const variantePredeterminada = producto.variantes[0];
    const imageUrls = producto.imagenes.map((img) => img.urlImagen);

    return {
      id: producto.id,
      name: producto.nombre,
      description: producto.descripcion,
      priceInCents: variantePredeterminada?.precioEnCents ?? 0,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      categoryId: producto.categoriaId,
      categoryName: producto.categoria?.nombre || null,
      stock: variantePredeterminada?.stock ?? 0,
      sku: variantePredeterminada?.sku ?? null,
      isActive: producto.activo,
      sortOrder: 0,
      createdAt: producto.creadoEn,
      updatedAt: producto.actualizadoEn,
    };
  }

  /**
   * Genera un slug a partir del nombre
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }

  /**
   * Actualiza un producto del catálogo
   * SEGURIDAD: Verifica que el item pertenece al negocio
   */
  async updateItem(
    tenantId: string,
    itemId: string,
    dto: UpdateCatalogItemDto,
  ): Promise<CatalogItemResponseDto> {
    const producto = await this.prisma.producto.findFirst({
      where: { id: itemId, negocioId: tenantId, eliminadoEn: null },
      include: { variantes: { where: { esPredeterminado: true } } },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Validar categoría si se actualiza
    if (dto.categoryId) {
      const categoria = await this.prisma.categoria.findFirst({
        where: { id: dto.categoryId, negocioId: tenantId, eliminadoEn: null },
      });
      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    // Actualizar Producto
    await this.prisma.producto.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined && { nombre: dto.name }),
        ...(dto.description !== undefined && { descripcion: dto.description }),
        ...(dto.categoryId !== undefined && { categoriaId: dto.categoryId }),
        ...(dto.isActive !== undefined && { activo: dto.isActive }),
      },
    });

    // Actualizar variante por defecto si hay cambios de precio/stock/sku
    if (dto.priceInCents !== undefined || dto.stock !== undefined || dto.sku !== undefined) {
      const variantePredeterminada = producto.variantes[0];
      if (variantePredeterminada) {
        await this.prisma.varianteProducto.update({
          where: { id: variantePredeterminada.id },
          data: {
            ...(dto.priceInCents !== undefined && { precioEnCents: dto.priceInCents }),
            ...(dto.stock !== undefined && { stock: dto.stock }),
            ...(dto.sku !== undefined && { sku: dto.sku }),
          },
        });
      }
    }

    // Re-fetch para obtener datos actualizados
    const finalProducto = await this.prisma.producto.findUnique({
      where: { id: itemId },
      include: {
        categoria: { select: { nombre: true } },
        imagenes: { orderBy: { orden: 'asc' } },
        variantes: { where: { esPredeterminado: true } },
      },
    });

    const variantePredeterminada = finalProducto!.variantes[0];
    const imageUrls = finalProducto!.imagenes.map((img) => img.urlImagen);

    return {
      id: finalProducto!.id,
      name: finalProducto!.nombre,
      description: finalProducto!.descripcion,
      priceInCents: variantePredeterminada?.precioEnCents ?? 0,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      categoryId: finalProducto!.categoriaId,
      categoryName: finalProducto!.categoria?.nombre || null,
      stock: variantePredeterminada?.stock ?? 0,
      sku: variantePredeterminada?.sku ?? null,
      isActive: finalProducto!.activo,
      sortOrder: 0,
      createdAt: finalProducto!.creadoEn,
      updatedAt: finalProducto!.actualizadoEn,
    };
  }

  /**
   * Elimina (soft delete) un producto del catálogo
   */
  async deleteItem(tenantId: string, itemId: string): Promise<void> {
    const producto = await this.prisma.producto.findFirst({
      where: { id: itemId, negocioId: tenantId, eliminadoEn: null },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.prisma.producto.update({
      where: { id: itemId },
      data: { activo: false, eliminadoEn: new Date() },
    });
  }

  /**
   * Lista las categorías del negocio (plano)
   */
  async listCategories(tenantId: string) {
    return this.prisma.categoria.findMany({
      where: { negocioId: tenantId, eliminadoEn: null, visible: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        urlImagen: true,
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene el árbol completo de categorías del negocio
   * Retorna estructura jerárquica con hijos anidados
   */
  async getCategoryTree(tenantId: string): Promise<CategoryNodeResponseDto[]> {
    const categorias = await this.prisma.categoria.findMany({
      where: { negocioId: tenantId, eliminadoEn: null },
      orderBy: [{ profundidad: 'asc' }, { orden: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        urlImagen: true,
        padreId: true,
        ruta: true,
        profundidad: true,
        orden: true,
        visible: true,
        creadoEn: true,
        actualizadoEn: true,
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    // Construir el árbol
    const categoryMap = new Map<string, CategoryNodeResponseDto>();
    const roots: CategoryNodeResponseDto[] = [];

    // Primera pasada: crear todos los nodos (mapeando a nombres en inglés para el frontend)
    for (const cat of categorias) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.nombre,
        description: cat.descripcion,
        imageUrl: cat.urlImagen,
        parentId: cat.padreId,
        path: cat.ruta,
        depth: cat.profundidad,
        sortOrder: cat.orden,
        isVisible: cat.visible,
        createdAt: cat.creadoEn,
        updatedAt: cat.actualizadoEn,
        _count: {
          inventoryItems: cat._count.productos,
        },
        children: [],
      });
    }

    // Segunda pasada: construir la jerarquía
    for (const cat of categorias) {
      const node = categoryMap.get(cat.id)!;
      if (cat.padreId && categoryMap.has(cat.padreId)) {
        categoryMap.get(cat.padreId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Crea una categoría (con soporte para jerarquía)
   */
  async createCategoryWithDto(
    tenantId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryNodeResponseDto> {
    const slug = this.generateSlug(dto.name);

    // Calcular ruta y profundidad basado en el padre
    let ruta = slug;
    let profundidad = 0;

    if (dto.parentId) {
      const padre = await this.prisma.categoria.findFirst({
        where: { id: dto.parentId, negocioId: tenantId, eliminadoEn: null },
      });

      if (!padre) {
        throw new NotFoundException('Categoría padre no encontrada');
      }

      ruta = `${padre.ruta}/${slug}`;
      profundidad = padre.profundidad + 1;
    }

    const categoria = await this.prisma.categoria.create({
      data: {
        negocioId: tenantId,
        nombre: dto.name,
        slug,
        descripcion: dto.description,
        padreId: dto.parentId,
        urlImagen: dto.imageUrl,
        orden: dto.sortOrder ?? 0,
        ruta,
        profundidad,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        urlImagen: true,
        padreId: true,
        ruta: true,
        profundidad: true,
        orden: true,
        visible: true,
        creadoEn: true,
        actualizadoEn: true,
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    return {
      id: categoria.id,
      name: categoria.nombre,
      description: categoria.descripcion,
      imageUrl: categoria.urlImagen,
      parentId: categoria.padreId,
      path: categoria.ruta,
      depth: categoria.profundidad,
      sortOrder: categoria.orden,
      isVisible: categoria.visible,
      createdAt: categoria.creadoEn,
      updatedAt: categoria.actualizadoEn,
      _count: {
        inventoryItems: categoria._count.productos,
      },
      children: [],
    };
  }

  /**
   * Crea una categoría (legacy - mantener compatibilidad)
   */
  async createCategory(tenantId: string, name: string, description?: string) {
    return this.createCategoryWithDto(tenantId, { name, description });
  }

  /**
   * Actualiza una categoría
   */
  async updateCategory(
    tenantId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryNodeResponseDto> {
    // Verificar que la categoría existe y pertenece al negocio
    const existing = await this.prisma.categoria.findFirst({
      where: { id: categoryId, negocioId: tenantId, eliminadoEn: null },
    });

    if (!existing) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Si cambia el padre, recalcular ruta y profundidad
    let pathUpdate: { ruta?: string; profundidad?: number } = {};

    if (dto.parentId !== undefined) {
      // Verificar que no se está moviendo a sí misma o a un hijo
      if (dto.parentId === categoryId) {
        throw new BadRequestException('Una categoría no puede ser su propio padre');
      }

      if (dto.parentId === null) {
        // Mover a raíz
        pathUpdate = {
          ruta: existing.slug,
          profundidad: 0,
        };
      } else {
        // Verificar que el nuevo padre existe
        const newParent = await this.prisma.categoria.findFirst({
          where: { id: dto.parentId, negocioId: tenantId, eliminadoEn: null },
        });

        if (!newParent) {
          throw new NotFoundException('Categoría padre no encontrada');
        }

        // Verificar que no es un descendiente (evitar ciclos)
        if (newParent.ruta.startsWith(existing.ruta + '/')) {
          throw new BadRequestException('No se puede mover una categoría a uno de sus descendientes');
        }

        pathUpdate = {
          ruta: `${newParent.ruta}/${existing.slug}`,
          profundidad: newParent.profundidad + 1,
        };
      }
    }

    // Si cambia el nombre, actualizar slug y ruta
    let slugUpdate: { slug?: string } = {};
    if (dto.name && dto.name !== existing.nombre) {
      const newSlug = this.generateSlug(dto.name);
      slugUpdate = { slug: newSlug };

      // Si no se está moviendo, actualizar la ruta con el nuevo slug
      if (dto.parentId === undefined) {
        const pathParts = existing.ruta.split('/');
        pathParts[pathParts.length - 1] = newSlug;
        pathUpdate = { ruta: pathParts.join('/') };
      } else if (pathUpdate.ruta) {
        const pathParts = pathUpdate.ruta.split('/');
        pathParts[pathParts.length - 1] = newSlug;
        pathUpdate.ruta = pathParts.join('/');
      }
    }

    const updated = await this.prisma.categoria.update({
      where: { id: categoryId },
      data: {
        ...(dto.name !== undefined && { nombre: dto.name }),
        ...(dto.description !== undefined && { descripcion: dto.description }),
        ...(dto.imageUrl !== undefined && { urlImagen: dto.imageUrl }),
        ...(dto.sortOrder !== undefined && { orden: dto.sortOrder }),
        ...(dto.isVisible !== undefined && { visible: dto.isVisible }),
        ...(dto.parentId !== undefined && { padreId: dto.parentId }),
        ...slugUpdate,
        ...pathUpdate,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        urlImagen: true,
        padreId: true,
        ruta: true,
        profundidad: true,
        orden: true,
        visible: true,
        creadoEn: true,
        actualizadoEn: true,
        _count: {
          select: {
            productos: true,
          },
        },
      },
    });

    // Si cambió la ruta, actualizar todos los descendientes
    if (pathUpdate.ruta && pathUpdate.ruta !== existing.ruta) {
      await this.updateDescendantsPaths(tenantId, existing.ruta, pathUpdate.ruta);
    }

    return {
      id: updated.id,
      name: updated.nombre,
      description: updated.descripcion,
      imageUrl: updated.urlImagen,
      parentId: updated.padreId,
      path: updated.ruta,
      depth: updated.profundidad,
      sortOrder: updated.orden,
      isVisible: updated.visible,
      createdAt: updated.creadoEn,
      updatedAt: updated.actualizadoEn,
      _count: {
        inventoryItems: updated._count.productos,
      },
      children: [],
    };
  }

  /**
   * Actualiza las rutas de todos los descendientes cuando se mueve una categoría
   */
  private async updateDescendantsPaths(
    tenantId: string,
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const descendants = await this.prisma.categoria.findMany({
      where: {
        negocioId: tenantId,
        ruta: { startsWith: oldPath + '/' },
        eliminadoEn: null,
      },
    });

    for (const desc of descendants) {
      const newDescPath = desc.ruta.replace(oldPath, newPath);
      const newDepth = newDescPath.split('/').length - 1;

      await this.prisma.categoria.update({
        where: { id: desc.id },
        data: { ruta: newDescPath, profundidad: newDepth },
      });
    }
  }

  /**
   * Elimina (soft delete) una categoría
   */
  async deleteCategory(tenantId: string, categoryId: string): Promise<void> {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: categoryId, negocioId: tenantId, eliminadoEn: null },
      include: {
        _count: {
          select: {
            productos: true,
            hijos: true,
          },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar si tiene productos
    if (categoria._count.productos > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene productos asignados',
      );
    }

    // Verificar si tiene subcategorías
    if (categoria._count.hijos > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene subcategorías. Elimina las subcategorías primero.',
      );
    }

    await this.prisma.categoria.update({
      where: { id: categoryId },
      data: { eliminadoEn: new Date(), visible: false },
    });
  }

  /**
   * Reordena múltiples categorías (y opcionalmente las mueve a nuevos padres)
   */
  async reorderCategories(tenantId: string, dto: ReorderCategoriesDto): Promise<void> {
    // Verificar que todas las categorías pertenecen al negocio
    const categoryIds = dto.categories.map((c) => c.id);
    const existingCategories = await this.prisma.categoria.findMany({
      where: {
        id: { in: categoryIds },
        negocioId: tenantId,
        eliminadoEn: null,
      },
    });

    if (existingCategories.length !== categoryIds.length) {
      throw new BadRequestException('Algunas categorías no existen o no pertenecen al negocio');
    }

    // Actualizar cada categoría
    for (const item of dto.categories) {
      const existing = existingCategories.find((c) => c.id === item.id)!;

      let updateData: any = { orden: item.sortOrder };

      // Si cambia el padre, recalcular ruta y profundidad
      if (item.parentId !== undefined && item.parentId !== existing.padreId) {
        if (item.parentId === null) {
          updateData.padreId = null;
          updateData.ruta = existing.slug;
          updateData.profundidad = 0;
        } else {
          const newParent = await this.prisma.categoria.findFirst({
            where: { id: item.parentId, negocioId: tenantId, eliminadoEn: null },
          });

          if (!newParent) {
            throw new BadRequestException(`Categoría padre ${item.parentId} no encontrada`);
          }

          // Verificar que no es un descendiente
          if (newParent.ruta.startsWith(existing.ruta + '/')) {
            throw new BadRequestException('No se puede mover una categoría a uno de sus descendientes');
          }

          updateData.padreId = item.parentId;
          updateData.ruta = `${newParent.ruta}/${existing.slug}`;
          updateData.profundidad = newParent.profundidad + 1;
        }

        // Actualizar descendientes si cambió la ruta
        if (updateData.ruta !== existing.ruta) {
          await this.updateDescendantsPaths(tenantId, existing.ruta, updateData.ruta);
        }
      }

      await this.prisma.categoria.update({
        where: { id: item.id },
        data: updateData,
      });
    }
  }
}
