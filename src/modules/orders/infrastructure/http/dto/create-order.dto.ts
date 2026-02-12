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

/**
 * DTO para un item del pedido
 */
export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID del producto o servicio' })
  @IsString({ message: 'productId debe ser un string válido' })
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
 * DTO para dirección de envío
 */
export class ShippingAddressDto {
  @ApiProperty({ description: 'Provincia', example: '1' })
  @IsString({ message: 'provincia debe ser un string válido' })
  @IsNotEmpty({ message: 'provincia es requerida' })
  provincia: string;

  @ApiProperty({ description: 'Cantón', example: '1-1' })
  @IsString({ message: 'canton debe ser un string válido' })
  @IsNotEmpty({ message: 'canton es requerido' })
  canton: string;

  @ApiProperty({ description: 'Distrito', example: '1-1-1' })
  @IsString({ message: 'distrito debe ser un string válido' })
  @IsNotEmpty({ message: 'distrito es requerido' })
  distrito: string;

  @ApiProperty({ description: 'Dirección exacta o señas', example: 'Frente al parque central, casa amarilla' })
  @IsString({ message: 'detalles debe ser texto' })
  @IsNotEmpty({ message: 'detalles es requerido' })
  detalles: string;
}

/**
 * DTO para crear una orden
 */
export class CreateOrderDto {
  @ApiProperty({ description: 'ID del tenant' })
  @IsString({ message: 'tenantId debe ser un string válido' })
  @IsNotEmpty({ message: 'tenantId es requerido' })
  tenantId: string;

  @ApiPropertyOptional({ description: 'ID del usuario autenticado' })
  @IsOptional()
  @IsString({ message: 'userId debe ser un string válido' })
  userId?: string;

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
    enum: ['CASH', 'CARD', 'TRANSFER', 'SINPE_MOVIL', 'OTHER'],
    default: 'SINPE_MOVIL',
  })
  @IsOptional()
  @IsEnum(['CASH', 'CARD', 'TRANSFER', 'SINPE_MOVIL', 'OTHER'], { message: 'paymentMethod debe ser SINPE_MOVIL, CASH, CARD, TRANSFER u OTHER' })
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'SINPE_MOVIL' | 'OTHER';

  @ApiPropertyOptional({
    description: 'Dirección de envío (solo para productos físicos)',
    type: ShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

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

  @ApiProperty({ enum: ['DRAFT', 'AWAITING_PAYMENT', 'APPROVED', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ enum: ['SINPE_MOVIL', 'CASH', 'CARD', 'TRANSFER', 'OTHER'], default: 'SINPE_MOVIL' })
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
