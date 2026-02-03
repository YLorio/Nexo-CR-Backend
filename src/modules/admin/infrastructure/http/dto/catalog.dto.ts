import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
<<<<<<< HEAD
  Min,
  MaxLength,
  IsArray,
=======
  IsUUID,
  Min,
  MaxLength,
  ValidateIf,
  IsArray,
  ValidateNested,
  IsEnum,
  Matches,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

<<<<<<< HEAD
export class CreateCatalogItemDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Camiseta Básica' })
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

<<<<<<< HEAD
  @ApiPropertyOptional({ description: 'Descripción', example: 'Camiseta 100% algodón' })
=======
  @ApiPropertyOptional({ description: 'Descripción', example: 'Corte clásico con tijera' })
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Stock inicial', example: 100 })
  @IsOptional()
=======
  @IsUUID('4', { message: 'categoryId debe ser un UUID válido' })
  categoryId?: string;

  @ApiProperty({ description: 'Es un servicio (requiere cita)', default: false })
  @IsBoolean()
  isService: boolean;

  @ApiPropertyOptional({ description: 'Stock inicial (solo para productos)', example: 100 })
  @ValidateIf((o) => !o.isService)
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

<<<<<<< HEAD
=======
  @ApiPropertyOptional({ description: 'Duración en minutos (solo para servicios)', example: 30 })
  @ValidateIf((o) => o.isService)
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración mínima es 1 minuto' })
  durationMinutes?: number;

>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  @ApiPropertyOptional({ description: 'SKU del producto' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;
<<<<<<< HEAD
}

export class UpdateCatalogItemDto {
  @ApiPropertyOptional({ description: 'Nombre del producto' })
=======

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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Stock' })
=======
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Stock (solo productos)' })
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

<<<<<<< HEAD
=======
  @ApiPropertyOptional({ description: 'Duración en minutos (solo servicios)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
=======

  @ApiPropertyOptional({
    description: 'Horarios del servicio (solo para servicios)',
    type: [ServiceScheduleBlockDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceScheduleBlockDto)
  schedules?: ServiceScheduleBlockDto[];
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
}

export class ListCatalogQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoría' })
  @IsOptional()
<<<<<<< HEAD
  @IsString()
  categoryId?: string;

=======
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo: producto o servicio' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isService?: boolean;

>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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

<<<<<<< HEAD
=======
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

>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
export class CatalogItemResponseDto {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
<<<<<<< HEAD
  imageUrl: string | null;
  imageUrls: string[];
  categoryId: string | null;
  categoryName?: string | null;
  stock: number;
  sku: string | null;
  isActive: boolean;
  sortOrder: number;
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  createdAt: Date;
  updatedAt: Date;
}
