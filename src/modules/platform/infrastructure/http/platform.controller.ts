import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlatformService } from '../../application/platform.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { ListTenantsQueryDto } from './dto/list-tenants.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('Platform (Super Admin)')
@ApiBearerAuth()
@Controller('api/v1/platform')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de la plataforma' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de la plataforma',
  })
  async getStats() {
    return this.platformService.getStats();
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Listar todos los tenants' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tenants',
  })
  async listTenants(@Query() query: ListTenantsQueryDto) {
    return this.platformService.listTenants(query);
  }

  @Post('tenants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Slug o email ya existe',
  })
  async createTenant(@Body() dto: CreateTenantDto) {
    return this.platformService.createTenant(dto);
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Obtener detalle de un tenant' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del tenant',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant no encontrado',
  })
  async getTenant(@Param('id') id: string) {
    return this.platformService.getTenantById(id);
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: 'Activar/Desactivar un tenant' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
  })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.platformService.toggleTenantStatus(id, isActive);
  }
}
