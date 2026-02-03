import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EstadoPedido } from '@prisma/client';
import {
  ListOrdersQueryDto,
  OrderResponseDto,
  OrderItemDto,
} from '../infrastructure/http/dto';

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

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista los pedidos del negocio para el Kanban
   * SEGURIDAD: Filtra SIEMPRE por negocioId del JWT
   */
  async listOrders(
    tenantId: string,
    query: ListOrdersQueryDto,
  ): Promise<{ data: OrderResponseDto[]; total: number }> {
    const { status, page = 1, limit = 50 } = query;

    const where: any = {
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
      total,
    };
  }

  /**
   * Mapea un pedido de Prisma a OrderResponseDto
   */
  private mapPedidoToDto(pedido: any): OrderResponseDto {
    // Obtener información del cliente desde PerfilCliente o PerfilInvitado
    let customerName = 'Cliente';
    let customerPhone = '';
    let customerEmail: string | null = null;

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
    };
  }

  /**
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

    for (const pedido of pedidos) {
      const mapped = this.mapPedidoToDto(pedido);
      const statusEn = STATUS_ES_TO_EN[pedido.estado as EstadoPedido];
      if (statusEn && kanban[statusEn]) {
        kanban[statusEn].push(mapped);
      }
    }

    return kanban;
  }

  /**
   * Actualiza el estado de un pedido
   * SEGURIDAD: Verifica que el pedido pertenece al negocio
   */
  async updateOrderStatus(
    tenantId: string,
    orderId: string,
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
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Validar transiciones de estado permitidas
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
      );
    }

    // Preparar datos de actualización
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
      where: { id: orderId },
      data: updateData,
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
    });

    return this.mapPedidoToDto(updated);
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
        },
        _sum: { totalCents: true },
      }),
      // Pedidos pendientes de pago
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
          stock: { lt: 10 },
        },
      }),
      // Total productos activos
      this.prisma.producto.count({
        where: {
          negocioId: tenantId,
          activo: true,
          eliminadoEn: null,
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
      },
    };
  }
}
