import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsHexColor,
  IsUrl,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrustBadgeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;
}

/**
 * DTO para actualizar la configuración del negocio
 */
export class UpdateSettingsDto {
  @ApiPropertyOptional({
    description: 'Nombre del negocio',
    example: 'Mi Tienda',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Tagline o descripción corta',
    example: 'La mejor tienda de la ciudad',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Número de WhatsApp (con código de país)',
    example: '+50688887777',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'Número de WhatsApp inválido',
  })
  whatsappNumber?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto',
    example: 'contacto@mitienda.com',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Color primario (hex)',
    example: '#6366f1',
  })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Color de acento (hex)',
    example: '#f59e0b',
  })
  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @ApiPropertyOptional({
    description: 'Color de fondo (hex)',
    example: '#ffffff',
  })
  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @ApiPropertyOptional({
    description: 'URL del logo',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'URLs de los banners de la tienda (max 3)',
    example: ['https://example.com/banner1.jpg', 'https://example.com/banner2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  bannerUrls?: string[];

  @ApiPropertyOptional({
    description: 'Configuración de los badges de confianza',
    type: [TrustBadgeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrustBadgeDto)
  trustBadges?: TrustBadgeDto[];

  @ApiPropertyOptional({
    description: 'Mostrar badges de confianza',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showTrustBadges?: boolean;
}
