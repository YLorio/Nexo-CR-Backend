import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para query params de GET /api/v1/booking/slots
 */
export class GetAvailableSlotsQueryDto {
  @IsString({ message: 'tenantId debe ser un string válido' })
  @IsNotEmpty({ message: 'tenantId es requerido' })
  tenantId: string;

  @IsString({ message: 'serviceId debe ser un string válido' })
  @IsNotEmpty({ message: 'serviceId es requerido' })
  serviceId: string;

  @IsDateString({}, { message: 'date debe tener formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'date es requerido' })
  date: string;
}

/**
 * DTO de respuesta para un slot disponible
 */
export class AvailableSlotResponseDto {
  startTime: string;
  endTime: string;
  availableSpots: number;
}

/**
 * DTO de respuesta para GET /api/v1/booking/slots
 */
export class GetAvailableSlotsResponseDto {
  date: string;
  dayOfWeek: string;
  serviceName: string;
  serviceDurationMinutes: number;
  slots: AvailableSlotResponseDto[];
  totalAvailableSlots: number;
}
