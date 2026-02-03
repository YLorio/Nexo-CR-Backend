import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DayOfWeek } from '@prisma/client';
import {
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
  ListCatalogQueryDto,
  CatalogItemResponseDto,
  ServiceScheduleBlockDto,
  ServiceScheduleResponseDto,
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
          id: item.id,
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
      },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isDefault: true } },
      },
    });

    // Actualizar variante por defecto si hay cambios de precio/stock/sku
    if (dto.priceInCents !== undefined || dto.stock !== undefined || dto.sku !== undefined) {
      const defaultVariant = existing.variants[0];
      if (defaultVariant) {
        await this.prisma.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            ...(dto.priceInCents !== undefined && { priceInCents: dto.priceInCents }),
            ...(dto.stock !== undefined && { stock: dto.stock }),
            ...(dto.sku !== undefined && { sku: dto.sku }),
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

    // Actualizar horarios si se proporcionan
    if (dto.schedules !== undefined) {
      await this.prisma.serviceTimeSlot.deleteMany({
        where: { serviceId: itemId },
      });

      if (dto.schedules.length > 0) {
        await this.prisma.serviceTimeSlot.createMany({
          data: dto.schedules.map((s) => ({
            serviceId: itemId,
            dayOfWeek: s.dayOfWeek as DayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            capacityOverride: s.capacity,
          })),
        });
      }
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
      where: { tenantId, deletedAt: null, isVisible: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
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
   * Crea una categoría
   */
  async createCategory(tenantId: string, name: string, description?: string) {
    const slug = this.generateSlug(name);

    return this.prisma.category.create({
      data: {
        tenantId,
        name,
        slug,
        path: slug, // Materialized path - root level
        description,
      },
    });
  }
}
