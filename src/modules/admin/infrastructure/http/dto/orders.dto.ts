import { IsEnum, IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums en inglés para la API (el servicio los traduce a español para la BD)
export enum OrderStatusApi {
  DRAFT = 'DRAFT',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado', enum: OrderStatusApi })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite por página', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({ description: 'Nuevo estado del pedido', enum: OrderStatusApi })
  @IsEnum(OrderStatusApi, { message: 'Estado inválido' })
  status: OrderStatusApi;
}

export class OrderItemDto {
  id: string;
  productName: string;
  quantity: number;
  unitPriceInCents: number;
  subtotalInCents: number;
}

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  subtotalInCents: number;
  totalInCents: number;
  status: string;
  paymentMethod: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
  items: OrderItemDto[];
  createdAt: Date;
  paidAt: Date | null;
  completedAt: Date | null;
}
