import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * DTO de query params para obtener el catálogo
 */
export class GetCatalogQueryDto {
  @ApiProperty({
    description: 'ID del tenant (negocio)',
    example: 'clxyz123abc456def789ghij',
  })
  @IsString()
  @IsNotEmpty({ message: 'tenantId es requerido' })
  tenantId: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría para filtrar (opcional)',
    example: 'clxyz123abc456def789ghij',
  })
  @IsOptional()
  @IsString()
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
    example: 'Electrónicos',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Todos nuestros productos electrónicos',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la categoría',
    example: 'https://storage.example.com/categories/electronics.jpg',
    nullable: true,
  })
  imageUrl: string | null;
}

/**
 * DTO de producto en la respuesta
 */
export class ProductDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Auriculares Bluetooth',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Auriculares inalámbricos con cancelación de ruido',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'URL de la imagen del producto (legacy)',
    example: 'https://storage.example.com/products/headphones.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'URLs de las imagenes del producto (max 3)',
    example: ['https://storage.example.com/products/img1.jpg', 'https://storage.example.com/products/img2.jpg'],
    type: [String],
  })
  imageUrls: string[];

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
    description: 'Stock disponible',
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
    example: 'Electrónicos',
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
    description: 'Lista de productos',
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
