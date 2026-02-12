import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta con información pública del tenant
 * Usado por el frontend para cargar tema y configuración
 */
export class TenantResponseDto {
  @ApiProperty({
    description: 'ID único del tenant',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Barbería Don Carlos',
  })
  name: string;

  @ApiProperty({
    description: 'Tagline o descripción corta',
    example: 'Cortes clásicos y modernos',
    nullable: true,
  })
  tagline: string | null;

  @ApiProperty({
    description: 'Slug único para la URL',
    example: 'barberia-don-carlos',
  })
  slug: string;

  @ApiProperty({
    description: 'URL del logo del negocio',
    example: 'https://storage.example.com/logos/barberia.png',
    nullable: true,
  })
  logoUrl: string | null;

  @ApiProperty({
    description: 'URLs de los banners de la tienda (max 3)',
    example: ['https://storage.example.com/banners/hero1.jpg', 'https://storage.example.com/banners/hero2.jpg'],
    type: [String],
  })
  bannerUrls: string[];

  @ApiProperty({
    description: 'Configuración del tema visual',
    example: { primaryColor: '#6366f1', accentColor: '#f59e0b', backgroundColor: '#ffffff' },
  })
  themeConfig: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };

  @ApiPropertyOptional({
    description: 'Badges de confianza configurados',
    example: [{ icon: 'truck', title: 'Envío', subtitle: 'Gratis' }],
  })
  trustBadges?: Array<{ icon: string; title: string; subtitle: string }>;

  @ApiPropertyOptional({
    description: 'Mostrar badges de confianza',
    example: true,
  })
  showTrustBadges?: boolean;

  @ApiProperty({
    description: 'Número de WhatsApp para contacto',
    example: '+50688887777',
  })
  whatsappNumber: string;

  @ApiProperty({
    description: 'Moneda del negocio',
    example: 'CRC',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Configuración extendida del tema y layout',
  })
  theme?: {
    config: any;
    layoutConfig?: any;
    fontFamilyHeading: string;
    fontFamilyBody: string;
  };
}
