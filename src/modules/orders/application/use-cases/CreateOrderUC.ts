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
  IUnitOfWork,
  ProductInfo,
} from '../ports/outbound';
import { Order, OrderItem, OrderItemProps } from '../../domain/entities';
import { OrderStatusEnum } from '../../domain/value-objects';
import {
  InsufficientStockError,
  ProductNotFoundError,
  OrderCreationError,
} from '../../domain/errors/OrderErrors';

/**
 * Caso de Uso: Crear Orden
 *
 * Ejecuta una transacción atómica que:
 * 1. Valida que todos los productos existan y estén activos
 * 2. Verifica stock para productos
 * 3. Decrementa stock de productos
 * 4. Crea la orden con sus items
 *
 * Si cualquier paso falla, toda la transacción se revierte.
 */
export class CreateOrderUC implements ICreateOrderUC {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
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

      // 3. Validar stock
      this.validateStock(command.items, productMap);

      // 4. Decrementar stock de productos
      await this.decrementStock(command.items);

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
        status: OrderStatusEnum.AWAITING_PAYMENT,
        paymentMethod: command.paymentMethod ?? 'SINPE_MOVIL',
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
    }
  }

  /**
   * Valida stock para productos
   */
  private validateStock(
    items: CreateOrderItemDTO[],
    productMap: Map<string, ProductInfo>,
  ): void {
    // Agrupar cantidades por producto (para validar stock total)
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const current = quantityByProduct.get(item.productId) || 0;
      quantityByProduct.set(item.productId, current + item.quantity);
    }

    for (const [productId, totalRequested] of quantityByProduct) {
      const product = productMap.get(productId)!;
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

  /**
   * Decrementa el stock de todos los productos
   */
  private async decrementStock(items: CreateOrderItemDTO[]): Promise<void> {
    // Agrupar cantidades por producto
    const quantityByProduct = new Map<string, number>();
    for (const item of items) {
      const current = quantityByProduct.get(item.productId) || 0;
      quantityByProduct.set(item.productId, current + item.quantity);
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
        unitPriceInCents: product.priceInCents,
        quantity: item.quantity,
      };

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
      unitPriceInCents: item.unitPriceInCents,
      quantity: item.quantity,
      subtotalInCents: item.subtotalInCents,
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
