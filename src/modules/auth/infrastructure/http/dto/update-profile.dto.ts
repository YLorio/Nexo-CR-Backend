import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar el perfil del usuario
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nombre del usuario' })
  @IsOptional()
  @IsString({ message: 'firstName debe ser texto' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario' })
  @IsOptional()
  @IsString({ message: 'lastName debe ser texto' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Teléfono del usuario' })
  @IsOptional()
  @IsString({ message: 'phone debe ser texto' })
  phone?: string;
}

/**
 * DTO de respuesta al actualizar perfil
 */
export class UpdateProfileResponseDto {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  email: string;

  @ApiPropertyOptional()
  firstName: string;

  @ApiPropertyOptional()
  lastName: string;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  phone: string | null;
}
