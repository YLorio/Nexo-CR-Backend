import { PrismaClient, EstadoPedido, MetodoPago } from '@prisma/client';
import { IOrderRepository } from '../../application/ports/outbound';
import { Order, OrderItem, OrderItemProps, PaymentMethodType } from '../../domain/entities';
import { OrderStatusEnum } from '../../domain/value-objects';
import { BaseRepository } from './BaseRepository';

// Mapeo de estados de dominio a Prisma
const DOMAIN_TO_PRISMA_STATUS: Record<OrderStatusEnum, EstadoPedido> = {
  [OrderStatusEnum.DRAFT]: EstadoPedido.BORRADOR,
  [OrderStatusEnum.AWAITING_PAYMENT]: EstadoPedido.ESPERANDO_PAGO,
  [OrderStatusEnum.AWAITING_APPROVAL]: EstadoPedido.ESPERANDO_APROBACION,
  [OrderStatusEnum.APPROVED]: EstadoPedido.APROBADO,
  [OrderStatusEnum.REJECTED]: EstadoPedido.RECHAZADO,
  [OrderStatusEnum.PROCESSING]: EstadoPedido.PROCESANDO,
  [OrderStatusEnum.READY]: EstadoPedido.LISTO,
  [OrderStatusEnum.SHIPPED]: EstadoPedido.ENVIADO,
  [OrderStatusEnum.COMPLETED]: EstadoPedido.COMPLETADO,
  [OrderStatusEnum.CANCELLED]: EstadoPedido.CANCELADO,
  [OrderStatusEnum.REFUNDED]: EstadoPedido.REEMBOLSADO,
};

const PRISMA_TO_DOMAIN_STATUS: Record<EstadoPedido, OrderStatusEnum> = {
  [EstadoPedido.BORRADOR]: OrderStatusEnum.DRAFT,
  [EstadoPedido.ESPERANDO_PAGO]: OrderStatusEnum.AWAITING_PAYMENT,
  [EstadoPedido.ESPERANDO_APROBACION]: OrderStatusEnum.AWAITING_APPROVAL,
  [EstadoPedido.APROBADO]: OrderStatusEnum.APPROVED,
  [EstadoPedido.RECHAZADO]: OrderStatusEnum.REJECTED,
  [EstadoPedido.PROCESANDO]: OrderStatusEnum.PROCESSING,
  [EstadoPedido.LISTO]: OrderStatusEnum.READY,
  [EstadoPedido.ENVIADO]: OrderStatusEnum.SHIPPED,
  [EstadoPedido.COMPLETADO]: OrderStatusEnum.COMPLETED,
  [EstadoPedido.CANCELADO]: OrderStatusEnum.CANCELLED,
  [EstadoPedido.REEMBOLSADO]: OrderStatusEnum.REFUNDED,
};

// Mapeo de metodos de pago
const DOMAIN_TO_PRISMA_PAYMENT: Record<string, MetodoPago> = {
  'SINPE_MOVIL': MetodoPago.SINPE_MOVIL,
  'CASH': MetodoPago.EFECTIVO,
  'CARD': MetodoPago.TARJETA,
  'TRANSFER': MetodoPago.TRANSFERENCIA,
  'OTHER': MetodoPago.OTRO,
};

const PRISMA_TO_DOMAIN_PAYMENT: Record<MetodoPago, PaymentMethodType> = {
  [MetodoPago.SINPE_MOVIL]: 'SINPE_MOVIL',
  [MetodoPago.EFECTIVO]: 'CASH',
  [MetodoPago.TARJETA]: 'CARD',
  [MetodoPago.TRANSFERENCIA]: 'TRANSFER',
  [MetodoPago.OTRO]: 'OTHER',
};

/**
 * Implementación Prisma del repositorio de órdenes
 * Adaptado al esquema en español
 */
export class PrismaOrderRepository extends BaseRepository implements IOrderRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async save(order: Order): Promise<Order> {
    const client = this.getClient();

    // Parse customer name into first/last name
    const nameParts = order.customerName.trim().split(' ');
    const nombre = nameParts[0] || '';
    const apellido = nameParts.slice(1).join(' ') || '';

    // Create perfil invitado for guest checkout
    const perfilInvitado = await client.perfilInvitado.create({
      data: {
        nombre,
        apellido,
        telefono: order.customerPhone,
        email: order.customerEmail,
        telefonoNormalizado: order.customerPhone.replace(/\D/g, ''),
        emailNormalizado: order.customerEmail?.toLowerCase(),
      },
    });

    // Crear el pedido con sus items
    const created = await client.pedido.create({
      data: {
        id: order.id,
        negocioId: order.tenantId,
        numeroPedido: String(order.orderNumber),
        estado: DOMAIN_TO_PRISMA_STATUS[order.status.value] || EstadoPedido.BORRADOR,
        metodoPago: DOMAIN_TO_PRISMA_PAYMENT[order.paymentMethod] || MetodoPago.OTRO,
        subtotalCents: order.subtotalInCents,
        totalCents: order.totalInCents,
        notasCliente: order.customerNotes,
        notasInternas: order.internalNotes,
        creadoEn: order.createdAt,
        actualizadoEn: order.updatedAt,
        pagadoEn: order.paidAt,
        completadoEn: order.completedAt,
        canceladoEn: order.cancelledAt,
        perfilInvitadoId: perfilInvitado.id,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            nombre: item.productName,
            varianteId: item.productId,
            precioUnitarioCents: item.unitPriceInCents,
            cantidad: item.quantity,
            totalCents: item.subtotalInCents,
          })),
        },
      },
      include: {
        items: true,
        perfilCliente: {
          include: {
            usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } },
          },
        },
        perfilInvitado: true,
      },
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<Order | null> {
    const client = this.getClient();

    const pedido = await client.pedido.findUnique({
      where: { id },
      include: {
        items: true,
        perfilCliente: {
          include: {
            usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } },
          },
        },
        perfilInvitado: true,
      },
    });

    if (!pedido) return null;

    return this.toDomainEntity(pedido);
  }

  async findByTenantAndNumber(
    tenantId: string,
    orderNumber: number,
  ): Promise<Order | null> {
    const client = this.getClient();

    const pedido = await client.pedido.findUnique({
      where: {
        negocioId_numeroPedido: {
          negocioId: tenantId,
          numeroPedido: String(orderNumber),
        },
      },
      include: {
        items: true,
        perfilCliente: {
          include: {
            usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } },
          },
        },
        perfilInvitado: true,
      },
    });

    if (!pedido) return null;

    return this.toDomainEntity(pedido);
  }

  async findByTenant(
    tenantId: string,
    options?: {
      status?: OrderStatusEnum;
      limit?: number;
      offset?: number;
    },
  ): Promise<Order[]> {
    const client = this.getClient();

    const pedidos = await client.pedido.findMany({
      where: {
        negocioId: tenantId,
        ...(options?.status && { estado: DOMAIN_TO_PRISMA_STATUS[options.status] }),
      },
      include: {
        items: true,
        perfilCliente: {
          include: {
            usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } },
          },
        },
        perfilInvitado: true,
      },
      orderBy: { creadoEn: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });

    return pedidos.map((pedido) => this.toDomainEntity(pedido));
  }

  async update(order: Order): Promise<Order> {
    const client = this.getClient();

    const updated = await client.pedido.update({
      where: { id: order.id },
      data: {
        estado: DOMAIN_TO_PRISMA_STATUS[order.status.value] || EstadoPedido.BORRADOR,
        notasInternas: order.internalNotes,
        actualizadoEn: order.updatedAt,
        pagadoEn: order.paidAt,
        completadoEn: order.completedAt,
        canceladoEn: order.cancelledAt,
      },
      include: {
        items: true,
        perfilCliente: {
          include: {
            usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } },
          },
        },
        perfilInvitado: true,
      },
    });

    return this.toDomainEntity(updated);
  }

  async getNextOrderNumber(tenantId: string): Promise<number> {
    const client = this.getClient();

    // Usar upsert para crear o actualizar el contador
    const contador = await client.contadorPedidos.upsert({
      where: { negocioId: tenantId },
      update: {
        ultimoNumero: {
          increment: 1,
        },
      },
      create: {
        negocioId: tenantId,
        ultimoNumero: 1,
      },
    });

    return contador.ultimoNumero;
  }

  private toDomainEntity(prismaPedido: any): Order {
    // Extraer nombre y datos del cliente
    let customerName = 'Cliente';
    let customerPhone = '';
    let customerEmail: string | null = null;

    if (prismaPedido.perfilCliente?.usuario) {
      const usuario = prismaPedido.perfilCliente.usuario;
      customerName = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = usuario.telefono || '';
      customerEmail = usuario.email || null;
    } else if (prismaPedido.perfilInvitado) {
      const invitado = prismaPedido.perfilInvitado;
      customerName = [invitado.nombre, invitado.apellido].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = invitado.telefono || '';
      customerEmail = invitado.email || null;
    }

    const items = prismaPedido.items.map((item: any) => {
      const props: OrderItemProps = {
        id: item.id,
        orderId: item.pedidoId,
        productId: item.varianteId || item.id,
        productName: item.nombre,
        unitPriceInCents: item.precioUnitarioCents,
        quantity: item.cantidad,
      };
      return new OrderItem(props);
    });

    return new Order({
      id: prismaPedido.id,
      tenantId: prismaPedido.negocioId,
      orderNumber: parseInt(prismaPedido.numeroPedido, 10) || 0,
      customerName,
      customerPhone,
      customerEmail,
      status: PRISMA_TO_DOMAIN_STATUS[prismaPedido.estado as EstadoPedido] || OrderStatusEnum.DRAFT,
      paymentMethod: prismaPedido.metodoPago ? PRISMA_TO_DOMAIN_PAYMENT[prismaPedido.metodoPago as MetodoPago] : 'OTHER',
      customerNotes: prismaPedido.notasCliente,
      internalNotes: prismaPedido.notasInternas,
      createdAt: prismaPedido.creadoEn,
      updatedAt: prismaPedido.actualizadoEn,
      paidAt: prismaPedido.pagadoEn,
      completedAt: prismaPedido.completadoEn,
      cancelledAt: prismaPedido.canceladoEn,
      items,
    });
  }
}
