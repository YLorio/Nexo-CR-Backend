import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para cancelar una orden
 */
export class CancelOrderDto {
  @ApiProperty({ description: 'ID del tenant' })
  @IsUUID('4', { message: 'tenantId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'tenantId es requerido' })
  tenantId: string;

  @ApiPropertyOptional({ description: 'Motivo de la cancelación' })
  @IsOptional()
  @IsString({ message: 'reason debe ser texto' })
  reason?: string;
}

/**
 * DTO de item con stock restaurado
 */
export class StockRestoredItemDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantityRestored: number;
}

/**
 * DTO de slot liberado
 */
export class SlotReleasedItemDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  appointmentDate: string;

  @ApiProperty()
  appointmentTime: string;
}

/**
 * DTO de respuesta para orden cancelada
 */
export class CancelledOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: number;

  @ApiProperty({ example: '#0042' })
  displayId: string;

  @ApiProperty({ example: 'CANCELLED' })
  status: string;

  @ApiProperty()
  cancelledAt: Date;

  @ApiProperty({
    description: 'Stock restaurado de productos físicos',
    type: [StockRestoredItemDto],
  })
  stockRestored: StockRestoredItemDto[];

  @ApiProperty({
    description: 'Slots de citas liberados',
    type: [SlotReleasedItemDto],
  })
  slotsReleased: SlotReleasedItemDto[];
}
