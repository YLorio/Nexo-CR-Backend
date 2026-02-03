import {
  IsString,
<<<<<<< HEAD
=======
  IsUUID,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  ValidateNested,
  IsEmail,
<<<<<<< HEAD
  Matches,
  ArrayMinSize,
=======
  IsDateString,
  Matches,
  ArrayMinSize,
  ValidateIf,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
<<<<<<< HEAD

// Enum en inglés para la API (el servicio lo traduce a español para la BD)
export enum PaymentMethodApi {
  SINPE_MOVIL = 'SINPE_MOVIL',
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}
=======
import { PaymentMethod } from '@prisma/client';
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

/**
 * DTO para un item del pedido
 */
export class CreateOrderItemDto {
<<<<<<< HEAD
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
=======
  @ApiProperty({ description: 'ID del producto o servicio' })
  @IsUUID('4', { message: 'productId debe ser un UUID válido' })
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  @IsNotEmpty({ message: 'productId es requerido' })
  productId: string;

  @ApiProperty({ description: 'Cantidad (mínimo 1)', default: 1 })
  @IsInt({ message: 'quantity debe ser un número entero' })
  @IsPositive({ message: 'quantity debe ser mayor a 0' })
  quantity: number;
<<<<<<< HEAD
=======

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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}

/**
 * DTO para crear una orden
 */
export class CreateOrderDto {
  @ApiProperty({ description: 'ID del tenant' })
<<<<<<< HEAD
  @IsString()
=======
  @IsUUID('4', { message: 'tenantId debe ser un UUID válido' })
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
    enum: PaymentMethodApi,
    default: PaymentMethodApi.SINPE_MOVIL,
  })
  @IsOptional()
  @IsEnum(PaymentMethodApi, { message: 'paymentMethod debe ser SINPE_MOVIL, CASH, CARD, TRANSFER u OTHER' })
  paymentMethod?: PaymentMethodApi;
=======
    enum: PaymentMethod,
    default: PaymentMethod.SINPE_MOVIL,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'paymentMethod debe ser SINPE_MOVIL, CASH, CARD, TRANSFER u OTHER' })
  paymentMethod?: PaymentMethod;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

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
<<<<<<< HEAD
=======
  isService: boolean;

  @ApiProperty()
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  unitPriceInCents: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  subtotalInCents: number;
<<<<<<< HEAD
=======

  @ApiPropertyOptional()
  appointmentDate: string | null;

  @ApiPropertyOptional()
  appointmentTime: string | null;

  @ApiPropertyOptional()
  durationMinutes: number | null;
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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

<<<<<<< HEAD
  @ApiProperty({ enum: ['AWAITING_PAYMENT', 'AWAITING_APPROVAL', 'APPROVED', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ enum: ['SINPE_MOVIL', 'CASH', 'CARD', 'TRANSFER', 'OTHER'], default: 'SINPE_MOVIL' })
=======
  @ApiProperty({ enum: ['PENDING_PAYMENT', 'PAID', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ enum: ['SINPE', 'CASH'], default: 'SINPE' })
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
