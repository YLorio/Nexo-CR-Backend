import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateOrderDto,
  CreatedOrderResponseDto,
  CancelOrderDto,
  CancelledOrderResponseDto,
  OrderParamsDto,
  GetOrderQueryDto,
  OrderResponseDto,
} from './dto';
import {
  ICreateOrderUC,
  CREATE_ORDER_UC,
  ICancelOrderUC,
  CANCEL_ORDER_UC,
} from '../../application/ports/inbound';
import { IOrderRepository, ORDER_REPOSITORY } from '../../application/ports/outbound';
import { Order } from '../../domain/entities';
import { Money } from '../../domain/value-objects';

@ApiTags('Orders')
@Controller('api/v1/orders')
export class OrdersController {
  constructor(
    @Inject(CREATE_ORDER_UC)
    private readonly createOrderUC: ICreateOrderUC,

    @Inject(CANCEL_ORDER_UC)
    private readonly cancelOrderUC: ICancelOrderUC,

    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Crea una nueva orden
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear orden',
    description: 'Crea una nueva orden con productos y/o servicios. Valida stock y disponibilidad.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: CreatedOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'Stock insuficiente o slot no disponible' })
  async createOrder(
    @Body() dto: CreateOrderDto,
  ): Promise<CreatedOrderResponseDto> {
    const result = await this.createOrderUC.execute({
      tenantId: dto.tenantId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      customerNotes: dto.customerNotes,
      items: dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        appointmentDate: item.appointmentDate,
        appointmentTime: item.appointmentTime,
      })),
    });

    return result;
  }

  /**
   * Obtiene el detalle de una orden
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener orden',
    description: 'Obtiene el detalle completo de una orden por su ID',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la orden',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async getOrder(
    @Param() params: OrderParamsDto,
    @Query() query: GetOrderQueryDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(params.id);

    if (!order || order.tenantId !== query.tenantId) {
      throw new NotFoundException(`Orden no encontrada: ${params.id}`);
    }

    return this.mapOrderToResponse(order);
  }

  /**
   * Cancela una orden
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar orden',
    description: 'Cancela una orden existente. Restaura stock y libera slots de citas.',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID de la orden' })
  @ApiBody({ type: CancelOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada exitosamente',
    type: CancelledOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 409, description: 'No se puede cancelar la orden' })
  async cancelOrder(
    @Param() params: OrderParamsDto,
    @Body() dto: CancelOrderDto,
  ): Promise<CancelledOrderResponseDto> {
    const result = await this.cancelOrderUC.execute({
      tenantId: dto.tenantId,
      orderId: params.id,
      reason: dto.reason,
    });

    return result;
  }

  /**
   * Mapea una entidad Order a OrderResponseDto
   */
  private mapOrderToResponse(order: Order): OrderResponseDto {
    const items = order.items.map((item) => ({
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
      appointmentDisplay: item.getAppointmentDisplay(),
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
      statusDisplay: order.status.toSpanish(),
      subtotalInCents: order.subtotalInCents,
      totalInCents: order.totalInCents,
      totalFormatted: order.total.format(),
      customerNotes: order.customerNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      items,
      hasPhysicalProducts: order.hasPhysicalProducts,
      hasServices: order.hasServices,
    };
  }
}
