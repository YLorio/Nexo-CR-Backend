import {
  IsString,
  IsUUID,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  ValidateNested,
  IsEmail,
  IsDateString,
  Matches,
  ArrayMinSize,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

/**
 * DTO para un item del pedido
 */
export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID del producto o servicio' })
  @IsUUID('4', { message: 'productId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'productId es requerido' })
  productId: string;

  @ApiProperty({ description: 'Cantidad (mínimo 1)', default: 1 })
  @IsInt({ message: 'quantity debe ser un número entero' })
  @IsPositive({ message: 'quantity debe ser mayor a 0' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Fecha de la cita (solo para servicios)',
    example: '2024-12-15',
  })
  @ValidateIf((o) => o.appointmentDate !== undefined)
  @IsDateString({}, { message: 'appointmentDate debe tener formato YYYY-MM-DD' })
  appointmentDate?: string;

  @ApiPropertyOptional({
    description: 'Hora de la cita (solo para servicios)',
    example: '10:00',
  })
  @ValidateIf((o) => o.appointmentTime !== undefined)
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'appointmentTime debe tener formato HH:mm (24 horas)',
  })
  appointmentTime?: string;
}

/**
 * DTO para crear una orden
 */
export class CreateOrderDto {
  @ApiProperty({ description: 'ID del tenant' })
  @IsUUID('4', { message: 'tenantId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'tenantId es requerido' })
  tenantId: string;

  @ApiProperty({ description: 'Nombre del cliente' })
  @IsString({ message: 'customerName debe ser texto' })
  @IsNotEmpty({ message: 'customerName es requerido' })
  customerName: string;

  @ApiProperty({ description: 'Teléfono del cliente', example: '+50688887777' })
  @IsString({ message: 'customerPhone debe ser texto' })
  @IsNotEmpty({ message: 'customerPhone es requerido' })
  @Matches(/^\+?[0-9\s\-\(\)]{8,20}$/, {
    message: 'customerPhone debe ser un número de teléfono válido',
  })
  customerPhone: string;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  @IsOptional()
  @IsEmail({}, { message: 'customerEmail debe ser un email válido' })
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales del cliente' })
  @IsOptional()
  @IsString({ message: 'customerNotes debe ser texto' })
  customerNotes?: string;

  @ApiPropertyOptional({
    description: 'Método de pago',
    enum: PaymentMethod,
    default: PaymentMethod.SINPE_MOVIL,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'paymentMethod debe ser SINPE_MOVIL, CASH, CARD, TRANSFER u OTHER' })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Lista de items del pedido',
    type: [CreateOrderItemDto],
  })
  @IsArray({ message: 'items debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

/**
 * DTO de respuesta para un item creado
 */
export class CreatedOrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  isService: boolean;

  @ApiProperty()
  unitPriceInCents: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  subtotalInCents: number;

  @ApiPropertyOptional()
  appointmentDate: string | null;

  @ApiPropertyOptional()
  appointmentTime: string | null;

  @ApiPropertyOptional()
  durationMinutes: number | null;
}

/**
 * DTO de respuesta para orden creada
 */
export class CreatedOrderResponseDto {
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

  @ApiProperty({ enum: ['PENDING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ enum: ['SINPE', 'CASH'], default: 'SINPE' })
  paymentMethod: string;

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

  @ApiProperty({ type: [CreatedOrderItemResponseDto] })
  items: CreatedOrderItemResponseDto[];
}
