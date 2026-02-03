import { PrismaClient, OrderStatus as PrismaOrderStatus, PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import { IOrderRepository } from '../../application/ports/outbound';
import { Order, OrderItem, OrderItemProps } from '../../domain/entities';
import { OrderStatusEnum } from '../../domain/value-objects';
import { BaseRepository } from './BaseRepository';

/**
 * Implementación Prisma del repositorio de órdenes
 * Adaptado al esquema actual de Prisma
 */
export class PrismaOrderRepository extends BaseRepository implements IOrderRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async save(order: Order): Promise<Order> {
    const client = this.getClient();

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
            totalCents: item.subtotalInCents,
          })),
        },
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
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<Order | null> {
    const client = this.getClient();

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
  }

  async findByTenantAndNumber(
    tenantId: string,
    orderNumber: number,
  ): Promise<Order | null> {
    const client = this.getClient();

    const order = await client.order.findUnique({
      where: {
        tenantId_orderNumber: {
          tenantId,
          orderNumber: String(orderNumber),
        },
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
    });

    if (!order) return null;

    return this.toDomainEntity(order);
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
      take: options?.limit,
      skip: options?.offset,
    });

    return orders.map((order) => this.toDomainEntity(order));
  }

  async update(order: Order): Promise<Order> {
    const client = this.getClient();

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
      },
    });

    return this.toDomainEntity(updated);
  }

  async getNextOrderNumber(tenantId: string): Promise<number> {
    const client = this.getClient();

    // Usar upsert para crear o actualizar el contador
    const counter = await client.tenantOrderCounter.upsert({
      where: { tenantId },
      update: {
        lastNumber: {
          increment: 1,
        },
      },
      create: {
        tenantId,
        lastNumber: 1,
      },
    });

    return counter.lastNumber;
  }

  private toDomainEntity(prismaOrder: any): Order {
    // Extraer nombre y datos del cliente
    let customerName = 'Cliente';
    let customerPhone = '';
    let customerEmail: string | null = null;

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
      };
      return new OrderItem(props);
    });

    return new Order({
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
      items,
    });
  }
}
