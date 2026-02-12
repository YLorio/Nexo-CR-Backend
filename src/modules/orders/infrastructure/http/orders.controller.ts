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
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
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
import { JwtAuthGuard } from '../../../../modules/auth/infrastructure/guards/jwt-auth.guard';
import { Public } from '../../../../modules/auth/infrastructure/decorators/public.decorator';
import { CurrentUser } from '../../../../modules/auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../modules/auth/application/auth.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';

@ApiTags('Orders')
@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    @Inject(CREATE_ORDER_UC)
    private readonly createOrderUC: ICreateOrderUC,

    @Inject(CANCEL_ORDER_UC)
    private readonly cancelOrderUC: ICancelOrderUC,

    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,

    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Obtiene las órdenes del usuario autenticado (Historial Global)
   * NOTA: Este método debe ir ANTES de cualquier ruta con parámetros como :id
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mis órdenes',
    description: 'Obtiene el historial de órdenes del usuario autenticado en todas las tiendas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes del usuario',
    type: [OrderResponseDto],
  })
  async getMyOrders(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByUserId(user.id);
    return orders.map((order) => this.mapOrderToResponse(order));
  }

  /**
   * Crea una nueva orden
   */
  @Public()
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
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CreatedOrderResponseDto> {
    const result = await this.createOrderUC.execute({
      tenantId: dto.tenantId,
      userId: user?.id || dto.userId, // Priorizar el del token si existe
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      customerNotes: dto.customerNotes,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
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
  @Public()
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
   * Sube el comprobante de pago
   */
  @Public()
  @Post(':id/payment-proof')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir comprobante de pago' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Comprobante subido correctamente' })
  async uploadPaymentProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Verificar que la orden existe
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Orden no encontrada: ${id}`);
    }

    // Subir imagen
    const result = await this.storageService.uploadFile(file, 'payment-proofs', {
      maxWidth: 800,
      maxHeight: 1200,
      quality: 80,
    });

    // Actualizar orden con la URL
    order.setPaymentProofUrl(result.url);
    await this.orderRepository.update(order);

    return { url: result.url };
  }

  /**
   * Mapea una entidad Order a OrderResponseDto
   */
  private mapOrderToResponse(order: Order): OrderResponseDto {
    const items = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
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
      paymentProofUrl: order.paymentProofUrl,
      shippingAddress: order.shippingAddress ? {
        provincia: order.shippingAddress.provincia,
        canton: order.shippingAddress.canton,
        distrito: order.shippingAddress.distrito,
        detalles: order.shippingAddress.detalles,
      } : null,
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
