import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IGetTenantBySlugUC, GET_TENANT_BY_SLUG_UC } from '../../application/ports/inbound';
import { TenantResponseDto } from './dto';

/**
 * Controlador para endpoints públicos de Tenant
 * Permite obtener información de configuración del negocio
 */
@ApiTags('Tenants')
@Controller('api/v1/tenants')
export class TenantController {
  constructor(
    @Inject(GET_TENANT_BY_SLUG_UC)
    private readonly getTenantBySlugUC: IGetTenantBySlugUC,
  ) {}

  /**
   * Obtiene la información pública de un tenant por su slug
   * Usado por el frontend para cargar tema, logo y configuración
   */
  @Get(':slug')
  @ApiOperation({
    summary: 'Obtener información del negocio por slug',
    description:
      'Retorna la información pública del negocio incluyendo tema visual, logo y número de WhatsApp',
  })
  @ApiParam({
    name: 'slug',
    description: 'Identificador único del negocio en la URL',
    example: 'barberia-don-carlos',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del tenant',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant no encontrado o inactivo',
  })
  async getTenantBySlug(@Param('slug') slug: string): Promise<TenantResponseDto> {
    const tenant = await this.getTenantBySlugUC.execute(slug);

    // Mapear a DTO de respuesta
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logoUrl: tenant.logoUrl,
      bannerUrls: tenant.bannerUrls,
      themeConfig: {
        primaryColor: tenant.primaryColor,
        accentColor: tenant.accentColor,
      },
      whatsappNumber: tenant.whatsappNumber,
      currency: tenant.currency,
    };
  }
}
