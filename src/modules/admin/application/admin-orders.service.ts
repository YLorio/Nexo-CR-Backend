import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import {
  ListOrdersQueryDto,
  OrderResponseDto,
  OrderItemDto,
} from '../infrastructure/http/dto';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista las órdenes del tenant para el Kanban
   * SEGURIDAD: Filtra SIEMPRE por tenantId del JWT
   */
  async listOrders(
    tenantId: string,
    query: ListOrdersQueryDto,
  ): Promise<{ data: OrderResponseDto[]; total: number }> {
    const { status, page = 1, limit = 50 } = query;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          customerProfile: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true, phone: true },
              },
            },
          },
          shadowProfile: {
            select: { firstName: true, lastName: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => this.mapOrderToDto(order)),
      total,
    };
  }

  /**
   * Mapea una orden de Prisma a OrderResponseDto
   */
  private mapOrderToDto(order: any): OrderResponseDto {
    // Obtener información del cliente desde CustomerProfile o ShadowProfile
    let customerName = 'Cliente';
    let customerPhone = '';
    let customerEmail: string | null = null;

    if (order.customerProfile?.user) {
      const user = order.customerProfile.user;
      customerName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = user.phone || '';
      customerEmail = user.email || null;
    } else if (order.shadowProfile) {
      const shadow = order.shadowProfile;
      customerName = [shadow.firstName, shadow.lastName].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = shadow.phone || '';
      customerEmail = shadow.email || null;
    }

    const items: OrderItemDto[] = order.items.map((item: any) => ({
      id: item.id,
      productName: item.name,
      productImageUrl: item.imageUrl || null,
      productIsService: item.serviceId !== null,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
      subtotalInCents: item.totalCents,
      appointmentDate: null,
      appointmentTime: null,
      durationMinutes: null,
    }));

    // Map shipping address if exists
    const shippingAddress = order.shippingAddress ? {
      provincia: order.shippingAddress.provincia.nombre,
      canton: order.shippingAddress.canton.nombre,
      distrito: order.shippingAddress.distrito.nombre,
      detalles: order.shippingAddress.streetAddress,
    } : null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      subtotalInCents: order.subtotalCents,
      totalInCents: order.totalCents,
      status: order.status,
      paymentMethod: order.paymentMethod || 'N/A',
      paymentProofUrl: order.paymentProofUrl,
      customerNotes: order.customerNotes,
      internalNotes: order.internalNotes,
      shippingAddress,
      items,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      completedAt: order.completedAt,
    };
  }

  /**
   * Obtiene todas las órdenes agrupadas por estado para el Kanban
   */
  async getOrdersForKanban(tenantId: string): Promise<Record<string, OrderResponseDto[]>> {
    const orders = await this.prisma.order.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        items: true,
        customerProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        shadowProfile: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Usar los estados válidos del enum OrderStatus
    const kanban: Record<string, OrderResponseDto[]> = {
      DRAFT: [],
      AWAITING_PAYMENT: [],
      AWAITING_APPROVAL: [],
      APPROVED: [],
      PROCESSING: [],
      READY: [],
      SHIPPED: [],
      COMPLETED: [],
      CANCELLED: [],
      REFUNDED: [],
    };

    for (const order of orders) {
      const mapped = this.mapOrderToDto(order);
      if (kanban[order.status]) {
        kanban[order.status].push(mapped);
      }
    }

    return kanban;
  }

  /**
   * Obtiene una orden específica por ID
   * SEGURIDAD: Verifica que la orden pertenece al tenant
   */
  async getOrderById(tenantId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
        deletedAt: null,
      },
      include: {
        items: true,
        shippingAddress: {
          include: {
            provincia: true,
            canton: true,
            distrito: true,
          },
        },
        customerProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        shadowProfile: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return this.mapOrderToDto(order);
  }

  /**
   * Actualiza el estado de una orden
   * SEGURIDAD: Verifica que la orden pertenece al tenant
   */
  async updateOrderStatus(
    tenantId: string,
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<OrderResponseDto> {
    // Verificar que la orden existe y pertenece al tenant
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
        deletedAt: null,
      },
      include: {
        items: true,
        customerProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        shadowProfile: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Validar transiciones de estado permitidas (incluyendo retrocesos)
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      DRAFT: [
        OrderStatus.AWAITING_PAYMENT,
        OrderStatus.AWAITING_APPROVAL,
        OrderStatus.CANCELLED,
      ],
      AWAITING_PAYMENT: [
        OrderStatus.APPROVED,
        OrderStatus.AWAITING_APPROVAL,
        OrderStatus.DRAFT, // Retroceder
        OrderStatus.CANCELLED,
      ],
      AWAITING_APPROVAL: [
        OrderStatus.APPROVED,
        OrderStatus.REJECTED,
        OrderStatus.DRAFT, // Retroceder
        OrderStatus.CANCELLED,
      ],
      APPROVED: [
        OrderStatus.PROCESSING,
        OrderStatus.AWAITING_APPROVAL, // Retroceder (SINPE)
        OrderStatus.AWAITING_PAYMENT, // Retroceder (CASH)
        OrderStatus.CANCELLED,
      ],
      REJECTED: [
        OrderStatus.AWAITING_APPROVAL, // Reenviar a aprobación
        OrderStatus.CANCELLED,
      ],
      PROCESSING: [
        OrderStatus.READY,
        OrderStatus.APPROVED, // Retroceder
        OrderStatus.CANCELLED,
      ],
      READY: [
        OrderStatus.SHIPPED,
        OrderStatus.COMPLETED,
        OrderStatus.PROCESSING, // Retroceder
        OrderStatus.CANCELLED,
      ],
      SHIPPED: [
        OrderStatus.COMPLETED,
        OrderStatus.READY, // Retroceder
        OrderStatus.CANCELLED,
      ],
      COMPLETED: [OrderStatus.REFUNDED],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${order.status} a ${newStatus}`,
      );
    }

    // Preparar datos de actualización
    const updateData: any = { status: newStatus };

    if (newStatus === OrderStatus.APPROVED) {
      updateData.approvedAt = new Date();
    } else if (newStatus === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (newStatus === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    } else if (newStatus === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        customerProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        shadowProfile: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    return this.mapOrderToDto(updated);
  }

  /**
   * Obtiene estadísticas del dashboard
   */
  async getDashboardStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      todayRevenue,
      pendingOrders,
      lowStockProducts,
      totalProducts,
      totalServices,
    ] = await Promise.all([
      // Órdenes de hoy
      this.prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: today },
          deletedAt: null,
        },
      }),
      // Ingresos de hoy (órdenes completadas o aprobadas)
      this.prisma.order.aggregate({
        where: {
          tenantId,
          status: { in: [OrderStatus.APPROVED, OrderStatus.COMPLETED] },
          paidAt: { gte: today },
          deletedAt: null,
        },
        _sum: { totalCents: true },
      }),
      // Pedidos pendientes de pago
      this.prisma.order.count({
        where: {
          tenantId,
          status: OrderStatus.AWAITING_PAYMENT,
          deletedAt: null,
        },
      }),
      // Productos con bajo stock (< 10)
      this.prisma.productVariant.count({
        where: {
          inventoryItem: {
            tenantId,
            isActive: true,
            deletedAt: null,
          },
          isActive: true,
          deletedAt: null,
          stock: { lt: 10 },
        },
      }),
      // Total productos activos
      this.prisma.inventoryItem.count({
        where: {
          tenantId,
          isActive: true,
          deletedAt: null,
        },
      }),
      // Total servicios activos
      this.prisma.serviceDefinition.count({
        where: {
          tenantId,
          isActive: true,
          deletedAt: null,
        },
      }),
    ]);

    return {
      today: {
        orders: todayOrders,
        revenue: todayRevenue._sum.totalCents || 0,
      },
      pending: {
        orders: pendingOrders,
      },
      inventory: {
        lowStock: lowStockProducts,
        totalProducts,
        totalServices,
      },
    };
  }
}
