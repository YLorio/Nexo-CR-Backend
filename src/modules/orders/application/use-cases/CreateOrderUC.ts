import { createId } from '@paralleldrive/cuid2';
import {
  ICreateOrderUC,
  CreateOrderCommand,
  CreateOrderItemDTO,
  CreatedOrderDTO,
  CreatedOrderItemDTO,
} from '../ports/inbound';
import {
  IOrderRepository,
  IProductRepository,
  ISlotAvailabilityChecker,
  IUnitOfWork,
  ProductInfo,
} from '../ports/outbound';
import { Order, OrderItem, OrderItemProps } from '../../domain/entities';
import { OrderStatusEnum, Money } from '../../domain/value-objects';
import {
  InsufficientStockError,
  SlotNotAvailableError,
  ProductNotFoundError,
  OrderCreationError,
} from '../../domain/errors/OrderErrors';

/**
 * Caso de Uso: Crear Orden
 *
 * Ejecuta una transacción atómica que:
 * 1. Valida que todos los productos existan y estén activos
 * 2. Verifica stock para productos físicos
 * 3. Verifica disponibilidad de slots para servicios
 * 4. Decrementa stock de productos físicos
 * 5. Crea la orden con sus items
 *
 * Si cualquier paso falla, toda la transacción se revierte.
 */
export class CreateOrderUC implements ICreateOrderUC {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
    private readonly slotChecker: ISlotAvailabilityChecker,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreatedOrderDTO> {
    // Validar que hay al menos un item
    if (!command.items || command.items.length === 0) {
      throw new OrderCreationError('Order must have at least one item');
    }

    // Ejecutar todo en una transacción
    return this.unitOfWork.executeInTransaction(async () => {
      // 1. Obtener información de todos los productos
      const productIds = command.items.map(item => item.productId);
      const products = await this.productRepository.findByIds(productIds);
      const productMap = new Map(products.map(p => [p.id, p]));

      // 2. Validar todos los productos
      this.validateProducts(command.items, productMap, command.tenantId);

      // 3. Validar stock y disponibilidad
      await this.validateStockAndAvailability(command.items, productMap, command.tenantId);

      // 4. Decrementar stock de productos físicos
      await this.decrementStock(command.items, productMap);

      // 5. Obtener siguiente número de orden
      const orderNumber = await this.orderRepository.getNextOrderNumber(command.tenantId);

      // 6. Crear los OrderItems
      const orderId = createId();
      const orderItems = this.createOrderItems(orderId, command.items, productMap);

      // 7. Determinar el estado inicial según el método de pago
      const paymentMethod = (command.paymentMethod as any) ?? 'SINPE_MOVIL';
      const initialStatus = paymentMethod === 'SINPE_MOVIL'
        ? OrderStatusEnum.AWAITING_APPROVAL  // SINPE requiere aprobación del comprobante
        : OrderStatusEnum.AWAITING_PAYMENT;  // CASH espera pago contra entrega

      // 8. Crear la orden
      const now = new Date();
      const order = new Order({
        id: orderId,
        tenantId: command.tenantId,
        userId: command.userId,
        orderNumber,
        customerName: command.customerName,
        customerPhone: command.customerPhone,
        customerEmail: command.customerEmail,
        status: initialStatus,
        paymentMethod,
        customerNotes: command.customerNotes,
        internalNotes: null,
        shippingAddress: command.shippingAddress || null,
        createdAt: now,
        updatedAt: now,
        paidAt: null,
        completedAt: null,
        cancelledAt: null,
        items: orderItems,
      });

      // 9. Guardar la orden
      const savedOrder = await this.orderRepository.save(order);

      // 10. Mapear a DTO de respuesta
      return this.toDTO(savedOrder);
    });
  }

  /**
   * Valida que todos los productos existan, estén activos y pertenezcan al tenant
   */
  private validateProducts(
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
    tenantId: string,
  ): void {
    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new ProductNotFoundError(item.productId);
      }

      if (!product.isActive) {
        throw new ProductNotFoundError(item.productId);
      }

      if (product.tenantId !== tenantId) {
        throw new ProductNotFoundError(item.productId);
      }

      // Validar que servicios tengan cita
      if (product.isService) {
        if (!item.appointmentDate || !item.appointmentTime) {
          throw new OrderCreationError(
            `Service "${product.name}" requires appointment date and time`,
          );
        }
      }
    }
  }

  /**
   * Valida stock para productos físicos y disponibilidad para servicios
   */
  private async validateStockAndAvailability(
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
    tenantId: string,
  ): Promise<void> {
    // Agrupar cantidades por producto (para validar stock total)
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const current = quantityByProduct.get(item.productId) || 0;
      quantityByProduct.set(item.productId, current + item.quantity);
    }

    for (const item of items) {
      const product = productMap.get(item.productId)!;

      if (product.isService) {
        // Verificar disponibilidad del slot
        const appointmentDate = new Date(item.appointmentDate!);
        const isAvailable = await this.slotChecker.isSlotAvailable({
          tenantId,
          date: appointmentDate,
          time: item.appointmentTime!,
          durationMinutes: product.durationMinutes!,
        });

        if (!isAvailable) {
          throw new SlotNotAvailableError(
            product.name,
            item.appointmentDate!,
            item.appointmentTime!,
          );
        }
      } else {
        // Verificar stock solo si trackInventory está activado
        if (product.trackInventory) {
          const totalRequested = quantityByProduct.get(item.productId)!;
          if (product.stock < totalRequested) {
            throw new InsufficientStockError(
              product.id,
              product.name,
              totalRequested,
              product.stock,
            );
          }
        }
      }
    }
  }

  /**
   * Decrementa el stock de todos los productos físicos (solo si trackInventory está activado)
   */
  private async decrementStock(
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
  ): Promise<void> {
    // Agrupar cantidades por producto
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      // Solo decrementar stock si es producto físico Y tiene control de inventario activado
      if (!product.isService && product.trackInventory) {
        const current = quantityByProduct.get(item.productId) || 0;
        quantityByProduct.set(item.productId, current + item.quantity);
      }
    }

    // Decrementar stock
    for (const [productId, quantity] of quantityByProduct) {
      await this.productRepository.decrementStock(productId, quantity);
    }
  }

  /**
   * Crea los objetos OrderItem a partir del comando
   */
  private createOrderItems(
    orderId: string,
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
  ): OrderItem[] {
    return items.map(item => {
      const product = productMap.get(item.productId)!;

      const props: OrderItemProps = {
        id: createId(),
        orderId,
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        productIsService: product.isService,
        unitPriceInCents: product.priceInCents,
        quantity: product.isService ? 1 : item.quantity,
      };

      // Agregar datos de cita para servicios
      if (product.isService) {
        props.appointmentDate = new Date(item.appointmentDate!);
        props.appointmentTime = item.appointmentTime;
        props.durationMinutes = product.durationMinutes;
      }

      return new OrderItem(props);
    });
  }

  /**
   * Mapea la entidad Order al DTO de respuesta
   */
  private toDTO(order: Order): CreatedOrderDTO {
    const items: CreatedOrderItemDTO[] = order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      isService: item.productIsService,
      unitPriceInCents: item.unitPriceInCents,
      quantity: item.quantity,
      subtotalInCents: item.subtotalInCents,
      appointmentDate: item.appointmentDate?.toISOString().split('T')[0] ?? null,
      appointmentTime: item.appointmentTime,
      durationMinutes: item.durationMinutes,
    }));

    return {
      id: order.id,
      tenantId: order.tenantId,
      orderNumber: order.orderNumber,
      displayId: order.getDisplayId(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      status: order.status.value,
      paymentMethod: order.paymentMethod,
      subtotalInCents: order.subtotalInCents,
      totalInCents: order.totalInCents,
      totalFormatted: order.total.format(),
      customerNotes: order.customerNotes,
      createdAt: order.createdAt,
      items,
    };
  }
}
