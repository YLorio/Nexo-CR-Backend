import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear una dirección de usuario
 */
export class CreateUserAddressDto {
  @ApiPropertyOptional({ description: 'Etiqueta de la dirección (ej: Casa, Trabajo)' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ description: 'ID de la provincia', example: '1' })
  @IsNotEmpty()
  @IsString()
  provinciaId: string;

  @ApiProperty({ description: 'ID del cantón', example: '1-1' })
  @IsNotEmpty()
  @IsString()
  cantonId: string;

  @ApiProperty({ description: 'ID del distrito', example: '1-1-7' })
  @IsNotEmpty()
  @IsString()
  distritoId: string;

  @ApiProperty({ description: 'Dirección exacta o señas' })
  @IsNotEmpty()
  @IsString()
  streetAddress: string;

  @ApiPropertyOptional({ description: 'Información adicional' })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @ApiPropertyOptional({ description: 'Nombre de contacto' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Marcar como dirección predeterminada', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * DTO para actualizar una dirección de usuario
 */
export class UpdateUserAddressDto {
  @ApiPropertyOptional({ description: 'Etiqueta de la dirección' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'ID de la provincia' })
  @IsOptional()
  @IsString()
  provinciaId?: string;

  @ApiPropertyOptional({ description: 'ID del cantón' })
  @IsOptional()
  @IsString()
  cantonId?: string;

  @ApiPropertyOptional({ description: 'ID del distrito' })
  @IsOptional()
  @IsString()
  distritoId?: string;

  @ApiPropertyOptional({ description: 'Dirección exacta o señas' })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiPropertyOptional({ description: 'Información adicional' })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @ApiPropertyOptional({ description: 'Nombre de contacto' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Marcar como dirección predeterminada' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

/**
 * DTO de respuesta con los datos de ubicación
 */
export class LocationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;
}

/**
 * DTO de respuesta de dirección de usuario
 */
export class UserAddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  label: string | null;

  @ApiProperty()
  provinciaId: string;

  @ApiProperty()
  cantonId: string;

  @ApiProperty()
  distritoId: string;

  @ApiProperty()
  streetAddress: string;

  @ApiPropertyOptional()
  additionalInfo: string | null;

  @ApiPropertyOptional()
  contactName: string | null;

  @ApiPropertyOptional()
  contactPhone: string | null;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty({ type: LocationResponseDto })
  provincia: LocationResponseDto;

  @ApiProperty({ type: LocationResponseDto })
  canton: LocationResponseDto;

  @ApiProperty({ type: LocationResponseDto })
  distrito: LocationResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
