import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  Matches,
  MinLength,
  MaxLength,
  IsHexColor,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Mi Tienda Online',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Slug único para la URL (ej: mi-tienda)',
    example: 'mi-tienda-online',
  })
  @IsString()
  @IsNotEmpty({ message: 'El slug es requerido' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  @MinLength(3, { message: 'El slug debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El slug no puede exceder 100 caracteres' })
  slug: string;

  @ApiProperty({
    description: 'Número de WhatsApp con código de país',
    example: '+50688887777',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de WhatsApp es requerido' })
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'Número de WhatsApp inválido',
  })
  whatsappNumber: string;

  @ApiPropertyOptional({
    description: 'Email del negocio',
    example: 'contacto@mitienda.cr',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Color primario en hexadecimal',
    example: '#6366f1',
    default: '#6366f1',
  })
  @IsOptional()
  @IsHexColor({ message: 'Color primario inválido' })
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Color de acento en hexadecimal',
    example: '#f59e0b',
    default: '#f59e0b',
  })
  @IsOptional()
  @IsHexColor({ message: 'Color de acento inválido' })
  accentColor?: string;

  @ApiPropertyOptional({
    description: 'URL del logo',
    example: 'https://ejemplo.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Código de moneda (ISO 4217)',
    example: 'CRC',
    default: 'CRC',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Tipo de plan',
    enum: PlanType,
    default: PlanType.FREE,
  })
  @IsOptional()
  @IsEnum(PlanType, { message: 'Tipo de plan inválido' })
  planType?: PlanType;

  // Datos del owner
  @ApiProperty({
    description: 'Nombre del propietario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del propietario es requerido' })
  ownerName: string;

  @ApiProperty({
    description: 'Email del propietario (será su login)',
    example: 'juan@mitienda.cr',
  })
  @IsEmail({}, { message: 'Email del propietario inválido' })
  @IsNotEmpty({ message: 'El email del propietario es requerido' })
  ownerEmail: string;

  @ApiProperty({
    description: 'Contraseña del propietario',
    example: 'securePassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  ownerPassword: string;
}
