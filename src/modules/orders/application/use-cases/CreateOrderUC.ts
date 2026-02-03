import { v4 as uuidv4 } from 'uuid';
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
<<<<<<< HEAD
=======
  ISlotAvailabilityChecker,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  IUnitOfWork,
  ProductInfo,
} from '../ports/outbound';
import { Order, OrderItem, OrderItemProps } from '../../domain/entities';
<<<<<<< HEAD
import { OrderStatusEnum } from '../../domain/value-objects';
import {
  InsufficientStockError,
=======
import { OrderStatusEnum, Money } from '../../domain/value-objects';
import {
  InsufficientStockError,
  SlotNotAvailableError,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  ProductNotFoundError,
  OrderCreationError,
} from '../../domain/errors/OrderErrors';

/**
 * Caso de Uso: Crear Orden
 *
 * Ejecuta una transacción atómica que:
 * 1. Valida que todos los productos existan y estén activos
<<<<<<< HEAD
 * 2. Verifica stock para productos
 * 3. Decrementa stock de productos
 * 4. Crea la orden con sus items
=======
 * 2. Verifica stock para productos físicos
 * 3. Verifica disponibilidad de slots para servicios
 * 4. Decrementa stock de productos físicos
 * 5. Crea la orden con sus items
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 *
 * Si cualquier paso falla, toda la transacción se revierte.
 */
export class CreateOrderUC implements ICreateOrderUC {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
<<<<<<< HEAD
=======
    private readonly slotChecker: ISlotAvailabilityChecker,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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

<<<<<<< HEAD
      // 3. Validar stock
      this.validateStock(command.items, productMap);

      // 4. Decrementar stock de productos
      await this.decrementStock(command.items);
=======
      // 3. Validar stock y disponibilidad
      await this.validateStockAndAvailability(command.items, productMap, command.tenantId);

      // 4. Decrementar stock de productos físicos
      await this.decrementStock(command.items, productMap);
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

      // 5. Obtener siguiente número de orden
      const orderNumber = await this.orderRepository.getNextOrderNumber(command.tenantId);

      // 6. Crear los OrderItems
      const orderId = uuidv4();
      const orderItems = this.createOrderItems(orderId, command.items, productMap);

      // 7. Crear la orden
      const now = new Date();
      const order = new Order({
        id: orderId,
        tenantId: command.tenantId,
        orderNumber,
        customerName: command.customerName,
        customerPhone: command.customerPhone,
        customerEmail: command.customerEmail,
<<<<<<< HEAD
        status: OrderStatusEnum.AWAITING_PAYMENT,
        paymentMethod: command.paymentMethod ?? 'SINPE_MOVIL',
=======
        status: OrderStatusEnum.PENDING_PAYMENT,
        paymentMethod: command.paymentMethod ?? 'SINPE',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        customerNotes: command.customerNotes,
        internalNotes: null,
        createdAt: now,
        updatedAt: now,
        paidAt: null,
        completedAt: null,
        cancelledAt: null,
        items: orderItems,
      });

      // 8. Guardar la orden
      const savedOrder = await this.orderRepository.save(order);

      // 9. Mapear a DTO de respuesta
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
<<<<<<< HEAD
=======

      // Validar que servicios tengan cita
      if (product.isService) {
        if (!item.appointmentDate || !item.appointmentTime) {
          throw new OrderCreationError(
            `Service "${product.name}" requires appointment date and time`,
          );
        }
      }
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    }
  }

  /**
<<<<<<< HEAD
   * Valida stock para productos
   */
  private validateStock(
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
  ): void {
=======
   * Valida stock para productos físicos y disponibilidad para servicios
   */
  private async validateStockAndAvailability(
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
    tenantId: string,
  ): Promise<void> {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    // Agrupar cantidades por producto (para validar stock total)
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const current = quantityByProduct.get(item.productId) || 0;
      quantityByProduct.set(item.productId, current + item.quantity);
    }

<<<<<<< HEAD
    for (const [productId, totalRequested] of quantityByProduct) {
      const product = productMap.get(productId)!;
      if (product.stock < totalRequested) {
        throw new InsufficientStockError(
          product.id,
          product.name,
          totalRequested,
          product.stock,
        );
=======
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
        // Verificar stock
        const totalRequested = quantityByProduct.get(item.productId)!;
        if (product.stock < totalRequested) {
          throw new InsufficientStockError(
            product.id,
            product.name,
            totalRequested,
            product.stock,
          );
        }
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      }
    }
  }

  /**
<<<<<<< HEAD
   * Decrementa el stock de todos los productos
   */
  private async decrementStock(items: CreateOrderItemDTO[]): Promise<void> {
    // Agrupar cantidades por producto
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const current = quantityByProduct.get(item.productId) || 0;
      quantityByProduct.set(item.productId, current + item.quantity);
=======
   * Decrementa el stock de todos los productos físicos
   */
  private async decrementStock(
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
  ): Promise<void> {
    // Agrupar cantidades por producto
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (!product.isService) {
        const current = quantityByProduct.get(item.productId) || 0;
        quantityByProduct.set(item.productId, current + item.quantity);
      }
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
        id: uuidv4(),
        orderId,
        productId: product.id,
        productName: product.name,
<<<<<<< HEAD
        unitPriceInCents: product.priceInCents,
        quantity: item.quantity,
      };

=======
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

>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
      unitPriceInCents: item.unitPriceInCents,
      quantity: item.quantity,
      subtotalInCents: item.subtotalInCents,
=======
      isService: item.productIsService,
      unitPriceInCents: item.unitPriceInCents,
      quantity: item.quantity,
      subtotalInCents: item.subtotalInCents,
      appointmentDate: item.appointmentDate?.toISOString().split('T')[0] ?? null,
      appointmentTime: item.appointmentTime,
      durationMinutes: item.durationMinutes,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
