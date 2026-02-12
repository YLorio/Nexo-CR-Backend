import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DayOfWeek, CategoryScope } from '@prisma/client';
import {
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
  ListCatalogQueryDto,
  CatalogItemResponseDto,
  ServiceScheduleBlockDto,
  ServiceScheduleResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
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
  isService: boolean;
  stock: number;
  durationMinutes: number | null;
  sku: string | null;
  trackInventory: boolean;
  isActive: boolean;
  sortOrder: number;
  schedules?: ServiceScheduleResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todos los items del catálogo del tenant (productos + servicios)
   * SEGURIDAD: Filtra SIEMPRE por tenantId del JWT
   */
  async listItems(
    tenantId: string,
    query: ListCatalogQueryDto,
  ): Promise<CatalogItemResponseDto[]> {
    const items: CatalogItem[] = [];

    // Filtrar productos (InventoryItem + ProductVariant)
    if (query.isService !== true) {
      const inventoryWhere: any = {
        tenantId,
        deletedAt: null,
      };

      if (query.categoryId) {
        inventoryWhere.categoryId = query.categoryId;
      }

      if (query.isActive !== undefined) {
        inventoryWhere.isActive = query.isActive;
      }

      if (query.search) {
        inventoryWhere.name = { contains: query.search };
      }

      const inventoryItems = await this.prisma.inventoryItem.findMany({
        where: inventoryWhere,
        include: {
          category: { select: { name: true } },
          variants: {
            where: { isDefault: true, deletedAt: null },
            take: 1,
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      for (const item of inventoryItems) {
        const defaultVariant = item.variants[0];
        const imageUrls = item.images.map((img) => img.imageUrl);
        const primaryImage = item.images.find((img) => img.isPrimary)?.imageUrl || imageUrls[0] || null;

        items.push({
          id: item.id, // ID del InventoryItem para edición/gestión en admin
          name: item.name,
          description: item.description,
          priceInCents: defaultVariant?.priceInCents ?? 0,
          imageUrl: primaryImage,
          imageUrls,
          categoryId: item.categoryId,
          categoryName: item.category?.name || null,
          isService: false,
          stock: defaultVariant?.stock ?? 0,
          durationMinutes: null,
          sku: defaultVariant?.sku ?? null,
          trackInventory: defaultVariant?.trackInventory ?? true,
          isActive: item.isActive,
          sortOrder: 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }
    }

    // Filtrar servicios (ServiceDefinition)
    if (query.isService !== false) {
      const serviceWhere: any = {
        tenantId,
        deletedAt: null,
      };

      if (query.categoryId) {
        serviceWhere.categoryId = query.categoryId;
      }

      if (query.isActive !== undefined) {
        serviceWhere.isActive = query.isActive;
      }

      if (query.search) {
        serviceWhere.name = { contains: query.search };
      }

      const services = await this.prisma.serviceDefinition.findMany({
        where: serviceWhere,
        include: {
          category: { select: { name: true } },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 3,
          },
          timeSlots: {
            where: { isBlocked: false },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
          },
          staffAssignments: {
            where: { isActive: true },
            include: {
              staff: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      for (const service of services) {
        const imageUrls = service.images.map((img) => img.imageUrl);
        const primaryImage = service.images.find((img) => img.isPrimary)?.imageUrl || imageUrls[0] || null;

        const schedules: ServiceScheduleResponseDto[] = service.timeSlots.map((slot) => ({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek || '',
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: slot.capacityOverride ?? service.maxCapacity,
          employeeId: null,
          employeeName: null,
          isActive: !slot.isBlocked,
        }));

        items.push({
          id: service.id,
          name: service.name,
          description: service.description,
          priceInCents: service.basePriceInCents,
          imageUrl: primaryImage,
          imageUrls,
          categoryId: service.categoryId,
          categoryName: service.category?.name || null,
          isService: true,
          stock: 0,
          durationMinutes: service.durationMinutes,
          sku: null,
          trackInventory: false,
          isActive: service.isActive,
          sortOrder: 0,
          schedules,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        });
      }
    }

    // Ordenar por fecha de creación
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return items;
  }

  /**
   * Crea un nuevo item en el catálogo
   * SEGURIDAD: Asigna el tenantId del JWT al nuevo item
   */
  async createItem(
    tenantId: string,
    dto: CreateCatalogItemDto,
  ): Promise<CatalogItemResponseDto> {
    // Validar que la categoría pertenece al tenant (si se especifica)
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          tenantId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    if (dto.isService) {
      // Crear servicio (ServiceDefinition)
      if (dto.schedules && dto.schedules.length > 0) {
        await this.validateScheduleStaff(tenantId, dto.schedules);
      }

      const slug = this.generateSlug(dto.name);

      const service = await this.prisma.serviceDefinition.create({
        data: {
          tenantId,
          name: dto.name,
          slug,
          description: dto.description,
          basePriceInCents: dto.priceInCents,
          durationMinutes: dto.durationMinutes ?? 30,
          categoryId: dto.categoryId,
          isActive: true,
          images: dto.imageUrls && dto.imageUrls.length > 0
            ? {
                create: dto.imageUrls.map((url, index) => ({
                  imageUrl: url,
                  sortOrder: index,
                  isPrimary: index === 0,
                })),
              }
            : dto.imageUrl
            ? {
                create: {
                  imageUrl: dto.imageUrl,
                  sortOrder: 0,
                  isPrimary: true,
                },
              }
            : undefined,
          timeSlots: dto.schedules && dto.schedules.length > 0
            ? {
                create: dto.schedules.map((s) => ({
                  dayOfWeek: s.dayOfWeek as DayOfWeek,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  capacityOverride: s.capacity,
                })),
              }
            : undefined,
        },
        include: {
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          timeSlots: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
        },
      });

      const imageUrls = service.images.map((img) => img.imageUrl);
      const schedules: ServiceScheduleResponseDto[] = service.timeSlots.map((slot) => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek || '',
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacityOverride ?? 1,
        employeeId: null,
        employeeName: null,
        isActive: !slot.isBlocked,
      }));

      return {
        id: service.id,
        name: service.name,
        description: service.description,
        priceInCents: service.basePriceInCents,
        imageUrl: imageUrls[0] || null,
        imageUrls,
        categoryId: service.categoryId,
        categoryName: service.category?.name || null,
        isService: true,
        stock: 0,
        durationMinutes: service.durationMinutes,
        sku: null,
        trackInventory: false,
        isActive: service.isActive,
        sortOrder: 0,
        schedules,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    } else {
      // Crear producto (InventoryItem + ProductVariant)
      const slug = this.generateSlug(dto.name);

      const inventoryItem = await this.prisma.inventoryItem.create({
        data: {
          tenantId,
          name: dto.name,
          slug,
          description: dto.description,
          categoryId: dto.categoryId,
          isActive: true,
          images: dto.imageUrls && dto.imageUrls.length > 0
            ? {
                create: dto.imageUrls.map((url, index) => ({
                  imageUrl: url,
                  sortOrder: index,
                  isPrimary: index === 0,
                })),
              }
            : dto.imageUrl
            ? {
                create: {
                  imageUrl: dto.imageUrl,
                  sortOrder: 0,
                  isPrimary: true,
                },
              }
            : undefined,
          variants: {
            create: {
              sku: dto.sku || `SKU-${Date.now()}`,
              priceInCents: dto.priceInCents,
              stock: dto.stock ?? 0,
              trackInventory: dto.trackInventory ?? true,
              isDefault: true,
              isActive: true,
            },
          },
        },
        include: {
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { where: { isDefault: true } },
        },
      });

      const defaultVariant = inventoryItem.variants[0];
      const imageUrls = inventoryItem.images.map((img) => img.imageUrl);

      return {
        id: inventoryItem.id,
        name: inventoryItem.name,
        description: inventoryItem.description,
        priceInCents: defaultVariant?.priceInCents ?? 0,
        imageUrl: imageUrls[0] || null,
        imageUrls,
        categoryId: inventoryItem.categoryId,
        categoryName: inventoryItem.category?.name || null,
        isService: false,
        stock: defaultVariant?.stock ?? 0,
        durationMinutes: null,
        sku: defaultVariant?.sku ?? null,
        trackInventory: defaultVariant?.trackInventory ?? true,
        isActive: inventoryItem.isActive,
        sortOrder: 0,
        createdAt: inventoryItem.createdAt,
        updatedAt: inventoryItem.updatedAt,
      };
    }
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
   * Valida que los staff en los schedules pertenecen al tenant
   */
  private async validateScheduleStaff(
    tenantId: string,
    schedules: ServiceScheduleBlockDto[],
  ): Promise<void> {
    const staffIds = schedules
      .filter((s) => s.employeeId)
      .map((s) => s.employeeId!);

    if (staffIds.length === 0) return;

    const uniqueIds = [...new Set(staffIds)];
    const staff = await this.prisma.tenantStaff.findMany({
      where: {
        id: { in: uniqueIds },
        tenantId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (staff.length !== uniqueIds.length) {
      throw new BadRequestException('Algunos empleados no son válidos');
    }
  }

  /**
   * Actualiza un item del catálogo
   * SEGURIDAD: Verifica que el item pertenece al tenant
   */
  async updateItem(
    tenantId: string,
    itemId: string,
    dto: UpdateCatalogItemDto,
  ): Promise<CatalogItemResponseDto> {
    // Primero intentar encontrar como InventoryItem
    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, tenantId, deletedAt: null },
      include: { variants: { where: { isDefault: true } } },
    });

    if (inventoryItem) {
      return this.updateInventoryItem(tenantId, itemId, dto, inventoryItem);
    }

    // Si no es InventoryItem, buscar como ServiceDefinition
    const service = await this.prisma.serviceDefinition.findFirst({
      where: { id: itemId, tenantId, deletedAt: null },
    });

    if (service) {
      return this.updateServiceDefinition(tenantId, itemId, dto);
    }

    throw new NotFoundException('Producto no encontrado');
  }

  private async updateInventoryItem(
    tenantId: string,
    itemId: string,
    dto: UpdateCatalogItemDto,
    existing: any,
  ): Promise<CatalogItemResponseDto> {
    // Validar categoría si se actualiza
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, tenantId, deletedAt: null },
      });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    // Actualizar InventoryItem
    const updated = await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        // Actualizar imagenes si se proporcionan
        ...(dto.imageUrls !== undefined && {
          images: {
            deleteMany: {},
            create: dto.imageUrls.map((url, index) => ({
              imageUrl: url,
              sortOrder: index,
              isPrimary: index === 0,
            })),
          },
        }),
      },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isDefault: true } },
      },
    });

    // Actualizar variante por defecto si hay cambios de precio/stock/sku/trackInventory
    if (dto.priceInCents !== undefined || dto.stock !== undefined || dto.sku !== undefined || dto.trackInventory !== undefined) {
      const defaultVariant = existing.variants[0];
      if (defaultVariant) {
        await this.prisma.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            ...(dto.priceInCents !== undefined && { priceInCents: dto.priceInCents }),
            ...(dto.stock !== undefined && { stock: dto.stock }),
            ...(dto.sku !== undefined && { sku: dto.sku }),
            ...(dto.trackInventory !== undefined && { trackInventory: dto.trackInventory }),
          },
        });
      }
    }

    // Re-fetch para obtener datos actualizados
    const finalItem = await this.prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isDefault: true } },
      },
    });

    const defaultVariant = finalItem!.variants[0];
    const imageUrls = finalItem!.images.map((img) => img.imageUrl);

    return {
      id: finalItem!.id,
      name: finalItem!.name,
      description: finalItem!.description,
      priceInCents: defaultVariant?.priceInCents ?? 0,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      categoryId: finalItem!.categoryId,
      categoryName: finalItem!.category?.name || null,
      isService: false,
      stock: defaultVariant?.stock ?? 0,
      durationMinutes: null,
      sku: defaultVariant?.sku ?? null,
      trackInventory: defaultVariant?.trackInventory ?? true,
      isActive: finalItem!.isActive,
      sortOrder: 0,
      createdAt: finalItem!.createdAt,
      updatedAt: finalItem!.updatedAt,
    };
  }

  private async updateServiceDefinition(
    tenantId: string,
    itemId: string,
    dto: UpdateCatalogItemDto,
  ): Promise<CatalogItemResponseDto> {
    // Validar categoría si se actualiza
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, tenantId, deletedAt: null },
      });
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    // Validar staff si hay schedules
    if (dto.schedules !== undefined) {
      await this.validateScheduleStaff(tenantId, dto.schedules);
    }

    const updated = await this.prisma.serviceDefinition.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priceInCents !== undefined && { basePriceInCents: dto.priceInCents }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        // Actualizar horarios si se proporcionan
        ...(dto.schedules !== undefined && {
          timeSlots: {
            deleteMany: {},
            create: dto.schedules.map((s) => ({
              dayOfWeek: s.dayOfWeek as DayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              capacityOverride: s.capacity,
            })),
          },
        }),
        // Actualizar imagenes si se proporcionan
        ...(dto.imageUrls !== undefined && {
          images: {
            deleteMany: {},
            create: dto.imageUrls.map((url, index) => ({
              imageUrl: url,
              sortOrder: index,
              isPrimary: index === 0,
            })),
          },
        }),
      },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        timeSlots: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      },
    });

    const imageUrls = updated.images.map((img) => img.imageUrl);
    const schedules: ServiceScheduleResponseDto[] = updated.timeSlots.map((slot) => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek || '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacityOverride ?? 1,
      employeeId: null,
      employeeName: null,
      isActive: !slot.isBlocked,
    }));

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      priceInCents: updated.basePriceInCents,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      categoryId: updated.categoryId,
      categoryName: updated.category?.name || null,
      isService: true,
      stock: 0,
      durationMinutes: updated.durationMinutes,
      sku: null,
      trackInventory: false,
      isActive: updated.isActive,
      sortOrder: 0,
      schedules,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Elimina (soft delete) un item del catálogo
   */
  async deleteItem(tenantId: string, itemId: string): Promise<void> {
    // Intentar como InventoryItem
    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: { id: itemId, tenantId, deletedAt: null },
    });

    if (inventoryItem) {
      await this.prisma.inventoryItem.update({
        where: { id: itemId },
        data: { isActive: false, deletedAt: new Date() },
      });
      return;
    }

    // Intentar como ServiceDefinition
    const service = await this.prisma.serviceDefinition.findFirst({
      where: { id: itemId, tenantId, deletedAt: null },
    });

    if (service) {
      await this.prisma.serviceDefinition.update({
        where: { id: itemId },
        data: { isActive: false, deletedAt: new Date() },
      });
      return;
    }

    throw new NotFoundException('Producto no encontrado');
  }

  /**
   * Lista las categorías del tenant
   */
  async listCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        parentId: true,
        path: true,
        depth: true,
        sortOrder: true,
        isVisible: true,
        _count: {
          select: {
            inventoryItems: true,
            serviceDefinitions: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene el árbol completo de categorías
   */
  async getCategoryTree(tenantId: string) {
    const categories = await this.prisma.category.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        parentId: true,
        path: true,
        depth: true,
        sortOrder: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            inventoryItems: true,
            serviceDefinitions: true,
          },
        },
      },
    });

    return this.buildTree(categories);
  }

  private buildTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, cat.id),
      }));
  }

  /**
   * Crea una categoría con soporte jerárquico
   */
  async createCategoryHierarchy(tenantId: string, dto: CreateCategoryDto) {
    const slug = this.generateSlug(dto.name);
    let path = slug;
    let depth = 0;

    if (dto.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: dto.parentId, tenantId, deletedAt: null },
      });

      if (!parent) {
        throw new NotFoundException('Categoría padre no encontrada');
      }

      path = `${parent.path}/${slug}`;
      depth = parent.depth + 1;
    }

    return this.prisma.category.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder || 0,
        path,
        depth,
        scope: CategoryScope.BOTH,
      },
    });
  }

  /**
   * Actualiza una categoría
   */
  async updateCategory(tenantId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    let path = category.path;
    let depth = category.depth;

    if (dto.parentId !== undefined && dto.parentId !== category.parentId) {
      if (dto.parentId === null) {
        path = category.slug;
        depth = 0;
      } else {
        const parent = await this.prisma.category.findFirst({
          where: { id: dto.parentId, tenantId, deletedAt: null },
        });

        if (!parent) {
          throw new NotFoundException('Categoría padre no encontrada');
        }

        path = `${parent.path}/${category.slug}`;
        depth = parent.depth + 1;
      }
      // TODO: Actualizar recursivamente el path de los hijos si esto fuera una app de gran escala
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
        path,
        depth,
      },
    });
  }

  /**
   * Elimina una categoría
   */
  async deleteCategory(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar si tiene hijos
    const hasChildren = await this.prisma.category.count({
      where: { parentId: id, deletedAt: null },
    });

    if (hasChildren > 0) {
      throw new BadRequestException('No se puede eliminar una categoría que tiene subcategorías');
    }

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isVisible: false },
    });
  }

  /**
   * Reordena categorías
   */
  async reorderCategories(tenantId: string, dto: ReorderCategoriesDto) {
    for (const item of dto.categories) {
      await this.prisma.category.updateMany({
        where: { id: item.id, tenantId },
        data: {
          sortOrder: item.sortOrder,
          ...(item.parentId !== undefined && { parentId: item.parentId }),
        },
      });
    }
  }

  /**
   * Crea una categoría (LEGACY - mantener para compatibilidad si es necesario)
   */
  async createCategory(tenantId: string, name: string, description?: string) {
    return this.createCategoryHierarchy(tenantId, { name, description });
  }
}
