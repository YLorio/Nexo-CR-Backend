import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado', enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

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
  @ApiPropertyOptional({ description: 'Nuevo estado del pedido', enum: OrderStatus })
  @IsEnum(OrderStatus, { message: 'Estado inválido' })
  status: OrderStatus;
}

export class OrderItemDto {
  id: string;
  productName: string;
  productIsService: boolean;
  quantity: number;
  unitPriceInCents: number;
  subtotalInCents: number;
  appointmentDate: string | null;
  appointmentTime: string | null;
  durationMinutes: number | null;
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
