import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  MaxLength,
  Matches,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un empleado
 */
export class CreateEmployeeDto {
  @ApiProperty({ description: 'Nombre del empleado', example: 'Juan Pérez' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'URL de la foto del empleado' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Email del empleado' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del empleado' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'IDs de los servicios que puede realizar',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  serviceIds?: string[];
}

/**
 * DTO para actualizar un empleado
 */
export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'Nombre del empleado' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'URL de la foto del empleado' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Email del empleado' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del empleado' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

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
    description: 'IDs de los servicios que puede realizar',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  serviceIds?: string[];
}

/**
 * DTO para un bloque de disponibilidad
 */
export class AvailabilityBlockDto {
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

  @ApiPropertyOptional({ description: 'Capacidad (clientes simultáneos)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}

/**
 * DTO para configurar horario de un empleado
 */
export class SetAvailabilityDto {
  @ApiProperty({
    description: 'Bloques de disponibilidad',
    type: [AvailabilityBlockDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityBlockDto)
  blocks: AvailabilityBlockDto[];
}

/**
 * DTO de respuesta de empleado
 */
export class EmployeeResponseDto {
  id: string;
  name: string;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  sortOrder: number;
  services: {
    id: string;
    productId: string;
    productName: string;
  }[];
  availabilityBlocks: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    capacity: number;
    isActive: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
