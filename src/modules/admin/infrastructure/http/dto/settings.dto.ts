import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsHexColor,
  IsUrl,
  MaxLength,
  Matches,
  IsArray,
} from 'class-validator';

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
<<<<<<< HEAD
    description: 'Tagline o descripción corta del negocio',
    example: 'Explora nuestro catálogo y encuentra lo que necesitas.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tagline?: string;

  @ApiPropertyOptional({
=======
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
}
