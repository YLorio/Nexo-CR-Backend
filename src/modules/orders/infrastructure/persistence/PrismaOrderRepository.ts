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

    let customerProfileId = null;

    if (order.userId) {
      // Buscar o crear el perfil del cliente para este tenant
      const profile = await client.customerProfile.upsert({
        where: {
          tenantId_userId: {
            tenantId: order.tenantId,
            userId: order.userId,
          },
        },
        update: {},
        create: {
          tenantId: order.tenantId,
          userId: order.userId,
        },
      });
      customerProfileId = profile.id;
    }

    // Crear dirección si existe
    let shippingAddressId = null;
    if (order.shippingAddress) {
      // Look up location IDs from names
      const provincia = await client.provincia.findFirst({
        where: { nombre: order.shippingAddress.provincia },
      });

      if (!provincia) {
        throw new Error(`Provincia not found: ${order.shippingAddress.provincia}`);
      }

      const canton = await client.canton.findFirst({
        where: {
          nombre: order.shippingAddress.canton,
          provinciaId: provincia.id,
        },
      });

      if (!canton) {
        throw new Error(`Cantón not found: ${order.shippingAddress.canton} in ${provincia.nombre}`);
      }

      const distrito = await client.distrito.findFirst({
        where: {
          nombre: order.shippingAddress.distrito,
          cantonId: canton.id,
        },
      });

      if (!distrito) {
        throw new Error(`Distrito not found: ${order.shippingAddress.distrito} in ${canton.nombre}`);
      }

      const address = await client.address.create({
        data: {
          tenantId: order.tenantId,
          provinciaId: provincia.id,
          cantonId: canton.id,
          distritoId: distrito.id,
          streetAddress: order.shippingAddress.detalles,
        },
      });
      shippingAddressId = address.id;
    }

    // Crear la orden con sus items en una sola operación
    const created = await client.order.create({
      data: {
        id: order.id,
        tenantId: order.tenantId,
        customerProfileId,
        shippingAddressId,
        orderNumber: String(order.orderNumber),
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        status: order.status.value as PrismaOrderStatus,
        paymentMethod: order.paymentMethod as PrismaPaymentMethod,
        paymentProofUrl: order.paymentProofUrl,
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
            imageUrl: item.productImageUrl,
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
        shippingAddress: {
          include: {
            provincia: true,
            canton: true,
            distrito: true,
          },
        },
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
        shippingAddress: {
          include: {
            provincia: true,
            canton: true,
            distrito: true,
          },
        },
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
        shippingAddress: {
          include: {
            provincia: true,
            canton: true,
            distrito: true,
          },
        },
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
        shippingAddress: true,
        customerProfile: true, // Asegurar que traemos el perfil
        shadowProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });

    return orders.map((order) => this.toDomainEntity(order));
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const client = this.getClient();

    const orders = await client.order.findMany({
      where: {
        customerProfile: {
          userId,
        },
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
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        shadowProfile: true,
      },
      orderBy: { createdAt: 'desc' },
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
        paymentProofUrl: order.paymentProofUrl,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        completedAt: order.completedAt,
        cancelledAt: order.cancelledAt,
      },
      include: {
        items: true,
        customerProfile: true,
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
    const items = prismaOrder.items.map((item: any) => {
      const props: OrderItemProps = {
        id: item.id,
        orderId: item.orderId,
        productId: item.serviceId || item.variantId || item.id,
        productName: item.name,
        productImageUrl: item.imageUrl || null,
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
      userId: prismaOrder.customerProfile?.userId || null,
      orderNumber: parseInt(prismaOrder.orderNumber, 10) || 0,
      customerName: prismaOrder.customerName,
      customerPhone: prismaOrder.customerPhone,
      customerEmail: prismaOrder.customerEmail,
      status: prismaOrder.status as OrderStatusEnum,
      paymentMethod: prismaOrder.paymentMethod,
      paymentProofUrl: prismaOrder.paymentProofUrl,
      customerNotes: prismaOrder.customerNotes,
      internalNotes: prismaOrder.internalNotes,
      shippingAddress: prismaOrder.shippingAddress ? {
        provincia: prismaOrder.shippingAddress.provincia.nombre,
        canton: prismaOrder.shippingAddress.canton.nombre,
        distrito: prismaOrder.shippingAddress.distrito.nombre,
        detalles: prismaOrder.shippingAddress.streetAddress,
      } : null,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
      paidAt: prismaOrder.paidAt,
      completedAt: prismaOrder.completedAt,
      cancelledAt: prismaOrder.cancelledAt,
      items,
    });
  }
}
