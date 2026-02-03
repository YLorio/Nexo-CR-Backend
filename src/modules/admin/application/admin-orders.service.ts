import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
<<<<<<< HEAD
import { EstadoPedido } from '@prisma/client';
=======
import { OrderStatus } from '@prisma/client';
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
import {
  ListOrdersQueryDto,
  OrderResponseDto,
  OrderItemDto,
} from '../infrastructure/http/dto';

<<<<<<< HEAD
// Mapeo de estados inglés a español
const STATUS_EN_TO_ES: Record<string, EstadoPedido> = {
  'DRAFT': EstadoPedido.BORRADOR,
  'AWAITING_PAYMENT': EstadoPedido.ESPERANDO_PAGO,
  'AWAITING_APPROVAL': EstadoPedido.ESPERANDO_APROBACION,
  'APPROVED': EstadoPedido.APROBADO,
  'REJECTED': EstadoPedido.RECHAZADO,
  'PROCESSING': EstadoPedido.PROCESANDO,
  'READY': EstadoPedido.LISTO,
  'SHIPPED': EstadoPedido.ENVIADO,
  'COMPLETED': EstadoPedido.COMPLETADO,
  'CANCELLED': EstadoPedido.CANCELADO,
  'REFUNDED': EstadoPedido.REEMBOLSADO,
};

const STATUS_ES_TO_EN: Record<EstadoPedido, string> = {
  [EstadoPedido.BORRADOR]: 'DRAFT',
  [EstadoPedido.ESPERANDO_PAGO]: 'AWAITING_PAYMENT',
  [EstadoPedido.ESPERANDO_APROBACION]: 'AWAITING_APPROVAL',
  [EstadoPedido.APROBADO]: 'APPROVED',
  [EstadoPedido.RECHAZADO]: 'REJECTED',
  [EstadoPedido.PROCESANDO]: 'PROCESSING',
  [EstadoPedido.LISTO]: 'READY',
  [EstadoPedido.ENVIADO]: 'SHIPPED',
  [EstadoPedido.COMPLETADO]: 'COMPLETED',
  [EstadoPedido.CANCELADO]: 'CANCELLED',
  [EstadoPedido.REEMBOLSADO]: 'REFUNDED',
};

=======
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
<<<<<<< HEAD
   * Lista los pedidos del negocio para el Kanban
   * SEGURIDAD: Filtra SIEMPRE por negocioId del JWT
=======
   * Lista las órdenes del tenant para el Kanban
   * SEGURIDAD: Filtra SIEMPRE por tenantId del JWT
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
   */
  async listOrders(
    tenantId: string,
    query: ListOrdersQueryDto,
  ): Promise<{ data: OrderResponseDto[]; total: number }> {
    const { status, page = 1, limit = 50 } = query;

    const where: any = {
<<<<<<< HEAD
      negocioId: tenantId,
      eliminadoEn: null,
    };

    if (status) {
      // Convertir status de inglés a español
      where.estado = STATUS_EN_TO_ES[status] || status;
    }

    const [pedidos, total] = await Promise.all([
      this.prisma.pedido.findMany({
        where,
        include: {
          items: true,
          perfilCliente: {
            include: {
              usuario: {
                select: { nombre: true, apellido: true, email: true, telefono: true },
              },
            },
          },
          perfilInvitado: {
            select: { nombre: true, apellido: true, email: true, telefono: true },
          },
        },
        orderBy: { creadoEn: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pedido.count({ where }),
    ]);

    return {
      data: pedidos.map((pedido) => this.mapPedidoToDto(pedido)),
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      total,
    };
  }

  /**
<<<<<<< HEAD
   * Mapea un pedido de Prisma a OrderResponseDto
   */
  private mapPedidoToDto(pedido: any): OrderResponseDto {
    // Obtener información del cliente desde PerfilCliente o PerfilInvitado
=======
   * Mapea una orden de Prisma a OrderResponseDto
   */
  private mapOrderToDto(order: any): OrderResponseDto {
    // Obtener información del cliente desde CustomerProfile o ShadowProfile
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    let customerName = 'Cliente';
    let customerPhone = '';
    let customerEmail: string | null = null;

<<<<<<< HEAD
    if (pedido.perfilCliente?.usuario) {
      const usuario = pedido.perfilCliente.usuario;
      customerName = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = usuario.telefono || '';
      customerEmail = usuario.email || null;
    } else if (pedido.perfilInvitado) {
      const invitado = pedido.perfilInvitado;
      customerName = [invitado.nombre, invitado.apellido].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = invitado.telefono || '';
      customerEmail = invitado.email || null;
    }

    const items: OrderItemDto[] = pedido.items.map((item: any) => ({
      id: item.id,
      productName: item.nombre,
      quantity: item.cantidad,
      unitPriceInCents: item.precioUnitarioCents,
      subtotalInCents: item.totalCents,
    }));

    return {
      id: pedido.id,
      orderNumber: pedido.numeroPedido,
      customerName,
      customerPhone,
      customerEmail,
      subtotalInCents: pedido.subtotalCents,
      totalInCents: pedido.totalCents,
      status: STATUS_ES_TO_EN[pedido.estado as EstadoPedido] || pedido.estado,
      paymentMethod: pedido.metodoPago || 'N/A',
      customerNotes: pedido.notasCliente,
      internalNotes: pedido.notasInternas,
      items,
      createdAt: pedido.creadoEn,
      paidAt: pedido.pagadoEn,
      completedAt: pedido.completadoEn,
=======
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
      productIsService: item.serviceId !== null,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
      subtotalInCents: item.totalCents,
      appointmentDate: null,
      appointmentTime: null,
      durationMinutes: null,
    }));

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
      customerNotes: order.customerNotes,
      internalNotes: order.internalNotes,
      items,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      completedAt: order.completedAt,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    };
  }

  /**
<<<<<<< HEAD
   * Obtiene todos los pedidos agrupados por estado para el Kanban
   */
  async getOrdersForKanban(tenantId: string): Promise<Record<string, OrderResponseDto[]>> {
    const pedidos = await this.prisma.pedido.findMany({
      where: { negocioId: tenantId, eliminadoEn: null },
      include: {
        items: true,
        perfilCliente: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true, email: true, telefono: true },
            },
          },
        },
        perfilInvitado: {
          select: { nombre: true, apellido: true, email: true, telefono: true },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    // Usar los estados en inglés para el frontend
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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

<<<<<<< HEAD
    for (const pedido of pedidos) {
      const mapped = this.mapPedidoToDto(pedido);
      const statusEn = STATUS_ES_TO_EN[pedido.estado as EstadoPedido];
      if (statusEn && kanban[statusEn]) {
        kanban[statusEn].push(mapped);
=======
    for (const order of orders) {
      const mapped = this.mapOrderToDto(order);
      if (kanban[order.status]) {
        kanban[order.status].push(mapped);
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      }
    }

    return kanban;
  }

  /**
<<<<<<< HEAD
   * Actualiza el estado de un pedido
   * SEGURIDAD: Verifica que el pedido pertenece al negocio
=======
   * Actualiza el estado de una orden
   * SEGURIDAD: Verifica que la orden pertenece al tenant
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
   */
  async updateOrderStatus(
    tenantId: string,
    orderId: string,
<<<<<<< HEAD
    newStatusEn: string,
  ): Promise<OrderResponseDto> {
    // Convertir status de inglés a español
    const newStatus = STATUS_EN_TO_ES[newStatusEn];
    if (!newStatus) {
      throw new BadRequestException(`Estado inválido: ${newStatusEn}`);
    }

    // Verificar que el pedido existe y pertenece al negocio
    const pedido = await this.prisma.pedido.findFirst({
      where: {
        id: orderId,
        negocioId: tenantId,
        eliminadoEn: null,
      },
      include: {
        items: true,
        perfilCliente: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true, email: true, telefono: true },
            },
          },
        },
        perfilInvitado: {
          select: { nombre: true, apellido: true, email: true, telefono: true },
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        },
      },
    });

<<<<<<< HEAD
    if (!pedido) {
=======
    if (!order) {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      throw new NotFoundException('Orden no encontrada');
    }

    // Validar transiciones de estado permitidas
<<<<<<< HEAD
    const validTransitions: Record<EstadoPedido, EstadoPedido[]> = {
      [EstadoPedido.BORRADOR]: [EstadoPedido.ESPERANDO_PAGO, EstadoPedido.CANCELADO],
      [EstadoPedido.ESPERANDO_PAGO]: [EstadoPedido.ESPERANDO_APROBACION, EstadoPedido.APROBADO, EstadoPedido.CANCELADO],
      [EstadoPedido.ESPERANDO_APROBACION]: [EstadoPedido.APROBADO, EstadoPedido.RECHAZADO],
      [EstadoPedido.APROBADO]: [EstadoPedido.PROCESANDO, EstadoPedido.CANCELADO],
      [EstadoPedido.RECHAZADO]: [EstadoPedido.CANCELADO],
      [EstadoPedido.PROCESANDO]: [EstadoPedido.LISTO, EstadoPedido.CANCELADO],
      [EstadoPedido.LISTO]: [EstadoPedido.ENVIADO, EstadoPedido.COMPLETADO, EstadoPedido.CANCELADO],
      [EstadoPedido.ENVIADO]: [EstadoPedido.COMPLETADO, EstadoPedido.CANCELADO],
      [EstadoPedido.COMPLETADO]: [EstadoPedido.REEMBOLSADO],
      [EstadoPedido.CANCELADO]: [],
      [EstadoPedido.REEMBOLSADO]: [],
    };

    if (!validTransitions[pedido.estado]?.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${pedido.estado} a ${newStatus}`,
=======
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      DRAFT: [OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED],
      AWAITING_PAYMENT: [OrderStatus.AWAITING_APPROVAL, OrderStatus.APPROVED, OrderStatus.CANCELLED],
      AWAITING_APPROVAL: [OrderStatus.APPROVED, OrderStatus.REJECTED],
      APPROVED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      REJECTED: [OrderStatus.CANCELLED],
      PROCESSING: [OrderStatus.READY, OrderStatus.CANCELLED],
      READY: [OrderStatus.SHIPPED, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      SHIPPED: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      COMPLETED: [OrderStatus.REFUNDED],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${order.status} a ${newStatus}`,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      );
    }

    // Preparar datos de actualización
<<<<<<< HEAD
    const updateData: any = { estado: newStatus };

    if (newStatus === EstadoPedido.APROBADO) {
      updateData.aprobadoEn = new Date();
    } else if (newStatus === EstadoPedido.COMPLETADO) {
      updateData.completadoEn = new Date();
    } else if (newStatus === EstadoPedido.CANCELADO) {
      updateData.canceladoEn = new Date();
    } else if (newStatus === EstadoPedido.ENVIADO) {
      updateData.enviadoEn = new Date();
    }

    const updated = await this.prisma.pedido.update({
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
<<<<<<< HEAD
        perfilCliente: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true, email: true, telefono: true },
            },
          },
        },
        perfilInvitado: {
          select: { nombre: true, apellido: true, email: true, telefono: true },
=======
        customerProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
        shadowProfile: {
          select: { firstName: true, lastName: true, email: true, phone: true },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        },
      },
    });

<<<<<<< HEAD
    return this.mapPedidoToDto(updated);
=======
    return this.mapOrderToDto(updated);
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
    ] = await Promise.all([
      // Pedidos de hoy
      this.prisma.pedido.count({
        where: {
          negocioId: tenantId,
          creadoEn: { gte: today },
          eliminadoEn: null,
        },
      }),
      // Ingresos de hoy (pedidos completados o aprobados)
      this.prisma.pedido.aggregate({
        where: {
          negocioId: tenantId,
          estado: { in: [EstadoPedido.APROBADO, EstadoPedido.COMPLETADO] },
          pagadoEn: { gte: today },
          eliminadoEn: null,
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        },
        _sum: { totalCents: true },
      }),
      // Pedidos pendientes de pago
<<<<<<< HEAD
      this.prisma.pedido.count({
        where: {
          negocioId: tenantId,
          estado: EstadoPedido.ESPERANDO_PAGO,
          eliminadoEn: null,
        },
      }),
      // Productos con bajo stock (< 10)
      this.prisma.varianteProducto.count({
        where: {
          producto: {
            negocioId: tenantId,
            activo: true,
            eliminadoEn: null,
          },
          activo: true,
          eliminadoEn: null,
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
          stock: { lt: 10 },
        },
      }),
      // Total productos activos
<<<<<<< HEAD
      this.prisma.producto.count({
        where: {
          negocioId: tenantId,
          activo: true,
          eliminadoEn: null,
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
=======
        totalServices,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      },
    };
  }
}
