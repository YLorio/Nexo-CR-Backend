import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  GetAvailableSlotsQueryDto,
  GetAvailableSlotsResponseDto,
} from './dto';
import {
  IGetAvailableSlotsUC,
  GET_AVAILABLE_SLOTS_UC,
} from '../../application/ports/inbound';

@ApiTags('Booking')
@Controller('api/v1/booking')
export class BookingController {
  constructor(
    @Inject(GET_AVAILABLE_SLOTS_UC)
    private readonly getAvailableSlotsUC: IGetAvailableSlotsUC,
  ) {}

  /**
   * Obtiene los slots disponibles para un servicio en una fecha específica
   */
  @Get('slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener slots disponibles',
    description: 'Retorna los horarios disponibles para reservar un servicio en una fecha específica',
  })
  @ApiQuery({ name: 'tenantId', type: String, description: 'ID del tenant' })
  @ApiQuery({ name: 'serviceId', type: String, description: 'ID del servicio' })
  @ApiQuery({ name: 'date', type: String, description: 'Fecha en formato YYYY-MM-DD' })
  @ApiResponse({
    status: 200,
    description: 'Lista de slots disponibles',
    type: GetAvailableSlotsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  async getAvailableSlots(
    @Query() query: GetAvailableSlotsQueryDto,
  ): Promise<GetAvailableSlotsResponseDto> {
    const result = await this.getAvailableSlotsUC.execute({
      tenantId: query.tenantId,
      serviceId: query.serviceId,
      date: new Date(query.date),
    });

    return {
      date: result.date.toISOString().split('T')[0],
      dayOfWeek: result.dayOfWeek,
      serviceName: result.serviceName,
      serviceDurationMinutes: result.serviceDurationMinutes,
      slots: result.slots,
      totalAvailableSlots: result.totalAvailableSlots,
    };
  }
}
