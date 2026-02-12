import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/application/auth.service';
import { UserAddressesService } from '../../application/user-addresses.service';
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
  UserAddressResponseDto,
} from './dto';

@ApiTags('User Addresses')
@Controller('api/v1/user-addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las direcciones del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de direcciones',
    type: [UserAddressResponseDto],
  })
  async getUserAddresses(@CurrentUser() user: AuthenticatedUser) {
    const addresses = await this.userAddressesService.getUserAddresses(user.id);
    return addresses.map((address) => this.mapToResponse(address));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una dirección específica' })
  @ApiResponse({
    status: 200,
    description: 'Dirección encontrada',
    type: UserAddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  async getUserAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
  ) {
    const address = await this.userAddressesService.getUserAddress(user.id, addressId);
    return this.mapToResponse(address);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva dirección' })
  @ApiResponse({
    status: 201,
    description: 'Dirección creada exitosamente',
    type: UserAddressResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createUserAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUserAddressDto,
  ) {
    const address = await this.userAddressesService.createUserAddress(user.id, dto);
    return this.mapToResponse(address);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada exitosamente',
    type: UserAddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  async updateUserAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
    @Body() dto: UpdateUserAddressDto,
  ) {
    const address = await this.userAddressesService.updateUserAddress(
      user.id,
      addressId,
      dto,
    );
    return this.mapToResponse(address);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Marcar dirección como predeterminada' })
  @ApiResponse({
    status: 200,
    description: 'Dirección marcada como predeterminada',
    type: UserAddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  async setDefaultAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
  ) {
    const address = await this.userAddressesService.setDefaultAddress(user.id, addressId);
    return this.mapToResponse(address);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una dirección' })
  @ApiResponse({ status: 204, description: 'Dirección eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  async deleteUserAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
  ) {
    await this.userAddressesService.deleteUserAddress(user.id, addressId);
  }

  /**
   * Mapear entidad de Prisma a DTO de respuesta
   */
  private mapToResponse(address: any): UserAddressResponseDto {
    return {
      id: address.id,
      label: address.label,
      provinciaId: address.provinciaId,
      cantonId: address.cantonId,
      distritoId: address.distritoId,
      streetAddress: address.streetAddress,
      additionalInfo: address.additionalInfo,
      contactName: address.contactName,
      contactPhone: address.contactPhone,
      isDefault: address.isDefault,
      provincia: {
        id: address.provincia.id,
        nombre: address.provincia.nombre,
      },
      canton: {
        id: address.canton.id,
        nombre: address.canton.nombre,
      },
      distrito: {
        id: address.distrito.id,
        nombre: address.distrito.nombre,
      },
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
