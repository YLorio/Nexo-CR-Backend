<<<<<<< HEAD
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
=======
import { PrismaClient, OrderStatus as PrismaOrderStatus, PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import { IOrderRepository } from '../../application/ports/outbound';
import { Order, OrderItem, OrderItemProps } from '../../domain/entities';
import { OrderStatusEnum } from '../../domain/value-objects';
import { BaseRepository } from './BaseRepository';

/**
 * Implementación Prisma del repositorio de órdenes
 * Adaptado al esquema actual de Prisma
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 */
export class PrismaOrderRepository extends BaseRepository implements IOrderRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async save(order: Order): Promise<Order> {
    const client = this.getClient();

<<<<<<< HEAD
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
=======
    // Crear la orden con sus items en una sola operación
    const created = await client.order.create({
      data: {
        id: order.id,
        tenantId: order.tenantId,
        orderNumber: String(order.orderNumber),
        status: order.status.value as PrismaOrderStatus,
        paymentMethod: order.paymentMethod as PrismaPaymentMethod,
        subtotalCents: order.subtotalInCents,
        totalCents: order.totalInCents,
        customerNotes: order.customerNotes,
        internalNotes: order.internalNotes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            name: item.productName,
            serviceId: item.productIsService ? item.productId : null,
            variantId: item.productIsService ? null : item.productId,
            unitPriceInCents: item.unitPriceInCents,
            quantity: item.quantity,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
            totalCents: item.subtotalInCents,
          })),
        },
      },
      include: {
        items: true,
<<<<<<< HEAD
        perfilCliente: {
          include: {
            usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } },
          },
        },
        perfilInvitado: true,
=======
        customerProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        shadowProfile: true,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      },
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<Order | null> {
    const client = this.getClient();

<<<<<<< HEAD
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
=======
    const order = await client.order.findUnique({
      where: { id },
      include: {
        items: true,
        customerProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        shadowProfile: true,
      },
    });

    if (!order) return null;

    return this.toDomainEntity(order);
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  }

  async findByTenantAndNumber(
    tenantId: string,
    orderNumber: number,
  ): Promise<Order | null> {
    const client = this.getClient();

<<<<<<< HEAD
    const pedido = await client.pedido.findUnique({
      where: {
        negocioId_numeroPedido: {
          negocioId: tenantId,
          numeroPedido: String(orderNumber),
=======
    const order = await client.order.findUnique({
      where: {
        tenantId_orderNumber: {
          tenantId,
          orderNumber: String(orderNumber),
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        },
      },
      include: {
        items: true,
<<<<<<< HEAD
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
=======
        customerProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        shadowProfile: true,
      },
    });

    if (!order) return null;

    return this.toDomainEntity(order);
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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

<<<<<<< HEAD
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
=======
    const orders = await client.order.findMany({
      where: {
        tenantId,
        ...(options?.status && { status: options.status as PrismaOrderStatus }),
      },
      include: {
        items: true,
        customerProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        shadowProfile: true,
      },
      orderBy: { createdAt: 'desc' },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      take: options?.limit,
      skip: options?.offset,
    });

<<<<<<< HEAD
    return pedidos.map((pedido) => this.toDomainEntity(pedido));
=======
    return orders.map((order) => this.toDomainEntity(order));
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  }

  async update(order: Order): Promise<Order> {
    const client = this.getClient();

<<<<<<< HEAD
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
=======
    const updated = await client.order.update({
      where: { id: order.id },
      data: {
        status: order.status.value as PrismaOrderStatus,
        internalNotes: order.internalNotes,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
      },
      include: {
        items: true,
        customerProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        shadowProfile: true,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      },
    });

    return this.toDomainEntity(updated);
  }

  async getNextOrderNumber(tenantId: string): Promise<number> {
    const client = this.getClient();

    // Usar upsert para crear o actualizar el contador
<<<<<<< HEAD
    const contador = await client.contadorPedidos.upsert({
      where: { negocioId: tenantId },
      update: {
        ultimoNumero: {
=======
    const counter = await client.tenantOrderCounter.upsert({
      where: { tenantId },
      update: {
        lastNumber: {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
          increment: 1,
        },
      },
      create: {
<<<<<<< HEAD
        negocioId: tenantId,
        ultimoNumero: 1,
      },
    });

    return contador.ultimoNumero;
  }

  private toDomainEntity(prismaPedido: any): Order {
=======
        tenantId,
        lastNumber: 1,
      },
    });

    return counter.lastNumber;
  }

  private toDomainEntity(prismaOrder: any): Order {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    // Extraer nombre y datos del cliente
    let customerName = 'Cliente';
    let customerPhone = '';
    let customerEmail: string | null = null;

<<<<<<< HEAD
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
=======
    if (prismaOrder.customerProfile?.user) {
      const user = prismaOrder.customerProfile.user;
      customerName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = user.phone || '';
      customerEmail = user.email || null;
    } else if (prismaOrder.shadowProfile) {
      const shadow = prismaOrder.shadowProfile;
      customerName = [shadow.firstName, shadow.lastName].filter(Boolean).join(' ') || 'Cliente';
      customerPhone = shadow.phone || '';
      customerEmail = shadow.email || null;
    }

    const items = prismaOrder.items.map((item: any) => {
      const props: OrderItemProps = {
        id: item.id,
        orderId: item.orderId,
        productId: item.serviceId || item.variantId || item.id,
        productName: item.name,
        productIsService: item.serviceId !== null,
        unitPriceInCents: item.unitPriceInCents,
        quantity: item.quantity,
        appointmentDate: null, // Managed by Booking model
        appointmentTime: null,
        durationMinutes: null,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      };
      return new OrderItem(props);
    });

    return new Order({
<<<<<<< HEAD
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
=======
      id: prismaOrder.id,
      tenantId: prismaOrder.tenantId,
      orderNumber: parseInt(prismaOrder.orderNumber, 10) || 0,
      customerName,
      customerPhone,
      customerEmail,
      status: prismaOrder.status as OrderStatusEnum,
      paymentMethod: prismaOrder.paymentMethod,
      customerNotes: prismaOrder.customerNotes,
      internalNotes: prismaOrder.internalNotes,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
      paidAt: prismaOrder.paidAt,
      completedAt: prismaOrder.completedAt,
      cancelledAt: prismaOrder.cancelledAt,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      items,
    });
  }
}
