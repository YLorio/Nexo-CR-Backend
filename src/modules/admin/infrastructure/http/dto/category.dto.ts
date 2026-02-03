import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para crear una categoría
 */
export class CreateCategoryDto {
  @ApiProperty({ description: 'Nombre de la categoría', example: 'Electrónicos' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de la categoría' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'ID de la categoría padre (para subcategorías)' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen de la categoría' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

/**
 * DTO para actualizar una categoría
 */
export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Nombre de la categoría' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción de la categoría' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'ID de la categoría padre' })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'URL de la imagen de la categoría' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Visibilidad de la categoría' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

/**
 * DTO para un item en el reordenamiento
 */
export class ReorderCategoryItemDto {
  @ApiProperty({ description: 'ID de la categoría' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Nuevo orden' })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiPropertyOptional({ description: 'Nuevo ID de categoría padre (para mover a otro nivel)' })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}

/**
 * DTO para reordenar múltiples categorías
 */
export class ReorderCategoriesDto {
  @ApiProperty({
    description: 'Lista de categorías con sus nuevas posiciones',
    type: [ReorderCategoryItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderCategoryItemDto)
  categories: ReorderCategoryItemDto[];
}

/**
 * Respuesta de categoría con información de hijos
 */
export class CategoryNodeResponseDto {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  path: string;
  depth: number;
  sortOrder: number;
  isVisible: boolean;
  children: CategoryNodeResponseDto[];
  _count: {
    inventoryItems: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
