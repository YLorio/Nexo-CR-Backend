import {
  ICancelOrderUC,
  CancelOrderCommand,
  CancelledOrderDTO,
  StockRestoredItem,
} from '../ports/inbound';
import {
  IOrderRepository,
  IProductRepository,
  IUnitOfWork,
} from '../ports/outbound';
import { Order } from '../../domain/entities';
import {
  OrderNotFoundError,
  InvalidOrderStatusTransitionError,
} from '../../domain/errors/OrderErrors';

/**
 * Caso de Uso: Cancelar Orden
 *
 * Ejecuta una transacción atómica que:
 * 1. Valida que la orden existe y pertenece al tenant
 * 2. Valida que la orden puede ser cancelada (estado válido)
 * 3. Revierte el stock de productos
 * 4. Marca la orden como CANCELLED
 */
export class CancelOrderUC implements ICancelOrderUC {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: CancelOrderCommand): Promise<CancelledOrderDTO> {
    return this.unitOfWork.executeInTransaction(async () => {
      // 1. Buscar la orden
      const order = await this.orderRepository.findById(command.orderId);

      if (!order) {
        throw new OrderNotFoundError(command.orderId);
      }

      // 2. Validar que pertenece al tenant
      if (order.tenantId !== command.tenantId) {
        throw new OrderNotFoundError(command.orderId);
      }

      // 3. Validar que se puede cancelar
      if (!order.status.canBeCancelled()) {
        throw new InvalidOrderStatusTransitionError(
          order.status.value,
          'CANCELLED',
        );
      }

      // 4. Revertir stock de productos
      const stockRestored = await this.restoreStock(order);

      // 5. Agregar nota interna si hay razón
      if (command.reason) {
        order.addInternalNote(`Cancelación: ${command.reason}`);
      }

      // 6. Cancelar la orden
      order.cancel();

      // 7. Guardar cambios
      const updatedOrder = await this.orderRepository.update(order);

      // 8. Retornar DTO
      return this.toDTO(updatedOrder, stockRestored);
    });
  }

  /**
   * Restaura el stock de todos los productos de la orden
   */
  private async restoreStock(order: Order): Promise<StockRestoredItem[]> {
    const restored: StockRestoredItem[] = [];

    // Agrupar cantidades por producto
    const quantityByProduct = new Map<
      string,
      { name: string; quantity: number }
    >();

    for (const item of order.items) {
      const existing = quantityByProduct.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        quantityByProduct.set(item.productId, {
          name: item.productName,
          quantity: item.quantity,
        });
      }
    }

    // Incrementar stock
    for (const [productId, info] of quantityByProduct) {
      await this.productRepository.incrementStock(productId, info.quantity);

      restored.push({
        productId,
        productName: info.name,
        quantityRestored: info.quantity,
      });
    }

    return restored;
  }

  /**
   * Mapea a DTO de respuesta
   */
  private toDTO(
    order: Order,
    stockRestored: StockRestoredItem[],
  ): CancelledOrderDTO {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      displayId: order.getDisplayId(),
      status: order.status.value,
      cancelledAt: order.cancelledAt!,
      stockRestored,
    };
  }
}
