import { IsOptional, IsBoolean, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class ListTenantsQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Buscar por nombre o slug',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de plan',
    enum: ['FREE', 'BASIC', 'PREMIUM'],
  })
  @IsOptional()
  @IsEnum(['FREE', 'BASIC', 'PREMIUM'])
  planType?: string;
}

export class TenantListItemDto {
  id: string;
  name: string;
  slug: string;
  whatsappNumber: string | null;
  email: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  currency: string;
  planType: string;
  isActive: boolean;
  createdAt: Date;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    products: number;
    orders: number;
  };
}

export class PaginatedTenantsDto {
  data: TenantListItemDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
