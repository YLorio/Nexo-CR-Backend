import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
  MaxLength,
  ValidateIf,
  IsArray,
  ValidateNested,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para configurar horario de un servicio
 */
export class ServiceScheduleBlockDto {
  @ApiProperty({
    description: 'Día de la semana',
    enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
  })
  @IsEnum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
  dayOfWeek: string;

  @ApiProperty({ description: 'Hora de inicio (HH:mm)', example: '09:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Formato de hora inválido. Use HH:mm' })
  startTime: string;

  @ApiProperty({ description: 'Hora de fin (HH:mm)', example: '18:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Formato de hora inválido. Use HH:mm' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Capacidad (cupos simultáneos)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'ID del empleado asignado (null = sin empleado específico)' })
  @IsOptional()
  @IsUUID('4')
  employeeId?: string;
}

export class CreateCatalogItemDto {
  @ApiProperty({ description: 'Nombre del producto/servicio', example: 'Corte de Cabello' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción', example: 'Corte clásico con tijera' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio en centavos', example: 500000 })
  @IsInt({ message: 'El precio debe ser un número entero' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  priceInCents: number;

  @ApiPropertyOptional({ description: 'URL de la imagen (legacy)' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URLs de las imagenes del producto (max 3)',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ description: 'ID de la categoría' })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId debe ser un UUID válido' })
  categoryId?: string;

  @ApiProperty({ description: 'Es un servicio (requiere cita)', default: false })
  @IsBoolean()
  isService: boolean;

  @ApiPropertyOptional({ description: 'Stock inicial (solo para productos)', example: 100 })
  @ValidateIf((o) => !o.isService)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  @ApiPropertyOptional({ description: 'Duración en minutos (solo para servicios)', example: 30 })
  @ValidateIf((o) => o.isService)
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración mínima es 1 minuto' })
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'SKU del producto' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({
    description: 'Horarios del servicio (solo para servicios)',
    type: [ServiceScheduleBlockDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceScheduleBlockDto)
  schedules?: ServiceScheduleBlockDto[];
}

export class UpdateCatalogItemDto {
  @ApiPropertyOptional({ description: 'Nombre del producto/servicio' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Precio en centavos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceInCents?: number;

  @ApiPropertyOptional({ description: 'URL de la imagen (legacy)' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URLs de las imagenes del producto (max 3)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ description: 'ID de la categoría' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Stock (solo productos)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Duración en minutos (solo servicios)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'SKU del producto' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Horarios del servicio (solo para servicios)',
    type: [ServiceScheduleBlockDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceScheduleBlockDto)
  schedules?: ServiceScheduleBlockDto[];
}

export class ListCatalogQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoría' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo: producto o servicio' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isService?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Buscar por nombre' })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Respuesta de horario de servicio
 */
export class ServiceScheduleResponseDto {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  capacity: number;
  employeeId: string | null;
  employeeName: string | null;
  isActive: boolean;
}

export class CatalogItemResponseDto {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  imageUrl: string | null; // Legacy - usar imageUrls
  imageUrls: string[]; // Array de URLs (max 3)
  categoryId: string | null;
  categoryName?: string | null;
  isService: boolean;
  stock: number;
  durationMinutes: number | null;
  sku: string | null;
  isActive: boolean;
  sortOrder: number;
  schedules?: ServiceScheduleResponseDto[]; // Horarios (solo para servicios)
  createdAt: Date;
  updatedAt: Date;
}
