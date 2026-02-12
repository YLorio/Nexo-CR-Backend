import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { LocationsService } from '../../application/locations.service';
import { ProvinciaDto, CantonDto, DistritoDto } from './dto/location.dto';

@ApiTags('Locations')
@Controller('api/v1/locations')
@Public() // Endpoints públicos, no requieren autenticación
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('provincias')
  @SkipThrottle() // Excluir del rate limiting - datos estáticos que se cachean
  @ApiOperation({ summary: 'Obtener todas las provincias con cantones y distritos' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de provincias',
    type: [ProvinciaDto],
  })
  async getAllProvincias() {
    return this.locationsService.getAllProvincias();
  }

  @Get('provincias/simple')
  @ApiOperation({ summary: 'Obtener solo las provincias (sin relaciones)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de provincias',
  })
  async getProvincias() {
    return this.locationsService.getProvincias();
  }

  @Get('provincias/:provinciaId/cantones')
  @ApiOperation({ summary: 'Obtener cantones de una provincia' })
  @ApiParam({ name: 'provinciaId', description: 'ID de la provincia', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cantones',
    type: [CantonDto],
  })
  async getCantonesByProvincia(@Param('provinciaId') provinciaId: string) {
    return this.locationsService.getCantonesByProvincia(provinciaId);
  }

  @Get('cantones/:cantonId/distritos')
  @ApiOperation({ summary: 'Obtener distritos de un cantón' })
  @ApiParam({ name: 'cantonId', description: 'ID del cantón', example: '1-1' })
  @ApiResponse({
    status: 200,
    description: 'Lista de distritos',
    type: [DistritoDto],
  })
  async getDistritosByCanton(@Param('cantonId') cantonId: string) {
    return this.locationsService.getDistritosByCanton(cantonId);
  }
}
