import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para parámetros de ruta
 */
export class OrderParamsDto {
  @IsString()
  @IsNotEmpty({ message: 'id es requerido' })
  id: string;
}

/**
 * DTO para query params de GET /orders/:id
 */
export class GetOrderQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'tenantId es requerido' })
  tenantId: string;
}

/**
 * DTO de item para respuesta de orden
 */
export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  unitPriceInCents: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  subtotalInCents: number;
}

/**
 * DTO de respuesta completa de una orden
 */
export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  orderNumber: number;

  @ApiProperty({ example: '#0042' })
  displayId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerPhone: string;

  @ApiPropertyOptional()
  customerEmail: string | null;

  @ApiProperty({ enum: ['AWAITING_PAYMENT', 'AWAITING_APPROVAL', 'APPROVED', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ description: 'Estado en español' })
  statusDisplay: string;

  @ApiProperty()
  subtotalInCents: number;

  @ApiProperty()
  totalInCents: number;

  @ApiProperty({ example: '₡37,500.00' })
  totalFormatted: string;

  @ApiPropertyOptional()
  customerNotes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  paidAt: Date | null;

  @ApiPropertyOptional()
  completedAt: Date | null;

  @ApiPropertyOptional()
  cancelledAt: Date | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
}
