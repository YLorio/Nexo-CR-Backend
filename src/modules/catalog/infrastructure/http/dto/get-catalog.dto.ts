import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
<<<<<<< HEAD
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
=======
import { IsUUID, IsOptional } from 'class-validator';
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

/**
 * DTO de query params para obtener el catálogo
 */
export class GetCatalogQueryDto {
  @ApiProperty({
    description: 'ID del tenant (negocio)',
<<<<<<< HEAD
    example: 'clxyz123abc456def789ghij',
  })
  @IsString()
  @IsNotEmpty({ message: 'tenantId es requerido' })
=======
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'tenantId debe ser un UUID válido' })
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  tenantId: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría para filtrar (opcional)',
<<<<<<< HEAD
    example: 'clxyz123abc456def789ghij',
  })
  @IsOptional()
  @IsString()
=======
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId debe ser un UUID válido' })
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
    example: 'Electrónicos',
=======
    example: 'Cortes de cabello',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
<<<<<<< HEAD
    example: 'Todos nuestros productos electrónicos',
=======
    example: 'Todos nuestros estilos de corte',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la categoría',
<<<<<<< HEAD
    example: 'https://storage.example.com/categories/electronics.jpg',
=======
    example: 'https://storage.example.com/categories/cortes.jpg',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    nullable: true,
  })
  imageUrl: string | null;
}

/**
<<<<<<< HEAD
 * DTO de producto en la respuesta
=======
 * DTO de producto/servicio en la respuesta
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 */
export class ProductDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
<<<<<<< HEAD
    description: 'Nombre del producto',
    example: 'Auriculares Bluetooth',
=======
    description: 'Nombre del producto o servicio',
    example: 'Corte clásico',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
<<<<<<< HEAD
    example: 'Auriculares inalámbricos con cancelación de ruido',
=======
    example: 'Corte tradicional con tijera y máquina',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
<<<<<<< HEAD
    description: 'URL de la imagen del producto (legacy)',
    example: 'https://storage.example.com/products/headphones.jpg',
=======
    description: 'URL de la imagen del producto',
    example: 'https://storage.example.com/products/corte-clasico.jpg',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
<<<<<<< HEAD
    description: 'URLs de las imagenes del producto (max 3)',
    example: ['https://storage.example.com/products/img1.jpg', 'https://storage.example.com/products/img2.jpg'],
    type: [String],
  })
  imageUrls: string[];

  @ApiProperty({
=======
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
    description: 'Stock disponible',
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
    example: 'Electrónicos',
=======
    example: 'Cortes de cabello',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
    description: 'Lista de productos',
=======
    description: 'Lista de productos/servicios',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
