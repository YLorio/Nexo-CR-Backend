import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IGetCatalogUC, GET_CATALOG_UC } from '../../application/ports/inbound';
import {
  GetCatalogQueryDto,
  CatalogResponseDto,
  ProductDto,
  CategoryDto,
} from './dto';

/**
 * Formatea un precio en centavos a formato de moneda costarricense
 */
function formatPrice(priceInCents: number): string {
  const price = priceInCents / 100;
  return `₡${price.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Controlador para endpoints del Catálogo
<<<<<<< HEAD
 * Permite obtener productos de un tenant
=======
 * Permite obtener productos y servicios de un tenant
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 */
@ApiTags('Catalog')
@Controller('api/v1/catalog')
export class CatalogController {
  constructor(
    @Inject(GET_CATALOG_UC)
    private readonly getCatalogUC: IGetCatalogUC,
  ) {}

  /**
<<<<<<< HEAD
   * Obtiene el catálogo de productos
=======
   * Obtiene el catálogo de productos y servicios
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
   * Opcionalmente filtrado por categoría
   */
  @Get()
  @ApiOperation({
<<<<<<< HEAD
    summary: 'Obtener catálogo de productos',
    description:
      'Retorna la lista de productos activos del negocio, con sus categorías. Opcionalmente filtrado por categoría.',
=======
    summary: 'Obtener catálogo de productos y servicios',
    description:
      'Retorna la lista de productos y servicios activos del negocio, con sus categorías. Opcionalmente filtrado por categoría.',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: 'ID del negocio',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'ID de categoría para filtrar (opcional)',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo obtenido exitosamente',
    type: CatalogResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async getCatalog(@Query() query: GetCatalogQueryDto): Promise<CatalogResponseDto> {
    const result = await this.getCatalogUC.execute({
      tenantId: query.tenantId,
      categoryId: query.categoryId,
    });

    // Mapear categorías
    const categories: CategoryDto[] = result.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
    }));

    // Mapear productos con formato de precio y disponibilidad
    const products: ProductDto[] = result.products.map((prod) => ({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      imageUrl: prod.imageUrl,
<<<<<<< HEAD
      imageUrls: prod.imageUrls,
      priceInCents: prod.priceInCents,
      priceFormatted: formatPrice(prod.priceInCents),
      stock: prod.stock,
      isAvailable: prod.stock > 0,
=======
      priceInCents: prod.priceInCents,
      priceFormatted: formatPrice(prod.priceInCents),
      isService: prod.isService,
      durationMinutes: prod.durationMinutes,
      stock: prod.stock,
      // Un servicio siempre está disponible, un producto físico necesita stock > 0
      isAvailable: prod.isService || prod.stock > 0,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      categoryId: prod.categoryId,
      categoryName: prod.categoryName,
    }));

    return {
      categories,
      products,
      totalProducts: result.totalProducts,
      filters: result.filters,
    };
  }
}
