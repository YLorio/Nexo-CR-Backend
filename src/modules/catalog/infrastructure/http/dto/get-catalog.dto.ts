import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

/**
 * DTO de query params para obtener el catálogo
 */
export class GetCatalogQueryDto {
  @ApiProperty({
    description: 'ID del tenant (negocio)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'tenantId debe ser un UUID válido' })
  tenantId: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría para filtrar (opcional)',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId debe ser un UUID válido' })
  categoryId?: string;
}

/**
 * DTO de categoría en la respuesta
 */
export class CategoryDto {
  @ApiProperty({
    description: 'ID único de la categoría',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Cortes de cabello',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Todos nuestros estilos de corte',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la categoría',
    example: 'https://storage.example.com/categories/cortes.jpg',
    nullable: true,
  })
  imageUrl: string | null;
}

/**
 * DTO de producto/servicio en la respuesta
 */
export class ProductDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del producto o servicio',
    example: 'Corte clásico',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Corte tradicional con tijera y máquina',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'URL de la imagen del producto',
    example: 'https://storage.example.com/products/corte-clasico.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Precio en centavos',
    example: 500000,
  })
  priceInCents: number;

  @ApiProperty({
    description: 'Precio formateado para mostrar',
    example: '₡5,000',
  })
  priceFormatted: string;

  @ApiProperty({
    description: 'Indica si es un servicio (true) o producto físico (false)',
    example: true,
  })
  isService: boolean;

  @ApiPropertyOptional({
    description: 'Duración en minutos (solo para servicios)',
    example: 30,
    nullable: true,
  })
  durationMinutes: number | null;

  @ApiProperty({
    description: 'Stock disponible (solo relevante para productos físicos)',
    example: 10,
  })
  stock: number;

  @ApiProperty({
    description: 'Indica si el producto está disponible para compra',
    example: true,
  })
  isAvailable: boolean;

  @ApiPropertyOptional({
    description: 'ID de la categoría a la que pertenece',
    example: '660e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  categoryId: string | null;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    example: 'Cortes de cabello',
    nullable: true,
  })
  categoryName: string | null;
}

/**
 * DTO de respuesta del catálogo completo
 */
export class CatalogResponseDto {
  @ApiProperty({
    description: 'Lista de categorías activas',
    type: [CategoryDto],
  })
  categories: CategoryDto[];

  @ApiProperty({
    description: 'Lista de productos/servicios',
    type: [ProductDto],
  })
  products: ProductDto[];

  @ApiProperty({
    description: 'Total de productos en la respuesta',
    example: 12,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Filtros aplicados',
    example: { tenantId: '550e8400-...', categoryId: null },
  })
  filters: {
    tenantId: string;
    categoryId: string | null;
  };
}
