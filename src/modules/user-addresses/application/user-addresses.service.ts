import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CreateUserAddressData {
  label?: string;
  provinciaId: string;
  cantonId: string;
  distritoId: string;
  streetAddress: string;
  additionalInfo?: string;
  contactName?: string;
  contactPhone?: string;
  isDefault?: boolean;
}

export interface UpdateUserAddressData {
  label?: string;
  provinciaId?: string;
  cantonId?: string;
  distritoId?: string;
  streetAddress?: string;
  additionalInfo?: string;
  contactName?: string;
  contactPhone?: string;
  isDefault?: boolean;
}

@Injectable()
export class UserAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener todas las direcciones de un usuario
   */
  async getUserAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        provincia: true,
        canton: true,
        distrito: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Obtener una dirección específica
   */
  async getUserAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId,
        deletedAt: null,
      },
      include: {
        provincia: true,
        canton: true,
        distrito: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  /**
   * Crear una nueva dirección
   */
  async createUserAddress(userId: string, data: CreateUserAddressData) {
    // Validar que la provincia, cantón y distrito existan
    await this.validateLocation(data.provinciaId, data.cantonId, data.distritoId);

    // Si se marca como predeterminada, desmarcar las demás
    if (data.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: {
          userId,
          isDefault: true,
          deletedAt: null,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.userAddress.create({
      data: {
        userId,
        label: data.label,
        provinciaId: data.provinciaId,
        cantonId: data.cantonId,
        distritoId: data.distritoId,
        streetAddress: data.streetAddress,
        additionalInfo: data.additionalInfo,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        isDefault: data.isDefault || false,
      },
      include: {
        provincia: true,
        canton: true,
        distrito: true,
      },
    });
  }

  /**
   * Actualizar una dirección
   */
  async updateUserAddress(userId: string, addressId: string, data: UpdateUserAddressData) {
    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await this.getUserAddress(userId, addressId);

    // Validar ubicación si se proporciona
    if (data.provinciaId || data.cantonId || data.distritoId) {
      await this.validateLocation(
        data.provinciaId || existingAddress.provinciaId,
        data.cantonId || existingAddress.cantonId,
        data.distritoId || existingAddress.distritoId,
      );
    }

    // Si se marca como predeterminada, desmarcar las demás
    if (data.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: {
          userId,
          isDefault: true,
          deletedAt: null,
          id: { not: addressId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: {
        label: data.label,
        provinciaId: data.provinciaId,
        cantonId: data.cantonId,
        distritoId: data.distritoId,
        streetAddress: data.streetAddress,
        additionalInfo: data.additionalInfo,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        isDefault: data.isDefault,
      },
      include: {
        provincia: true,
        canton: true,
        distrito: true,
      },
    });
  }

  /**
   * Eliminar una dirección (soft delete)
   */
  async deleteUserAddress(userId: string, addressId: string) {
    // Verificar que la dirección existe y pertenece al usuario
    await this.getUserAddress(userId, addressId);

    await this.prisma.userAddress.update({
      where: { id: addressId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Marcar una dirección como predeterminada
   */
  async setDefaultAddress(userId: string, addressId: string) {
    // Verificar que la dirección existe y pertenece al usuario
    await this.getUserAddress(userId, addressId);

    // Desmarcar todas las direcciones predeterminadas del usuario
    await this.prisma.userAddress.updateMany({
      where: {
        userId,
        isDefault: true,
        deletedAt: null,
      },
      data: {
        isDefault: false,
      },
    });

    // Marcar la dirección seleccionada como predeterminada
    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: {
        isDefault: true,
      },
      include: {
        provincia: true,
        canton: true,
        distrito: true,
      },
    });
  }

  /**
   * Validar que provincia, cantón y distrito existan y estén relacionados
   */
  private async validateLocation(provinciaId: string, cantonId: string, distritoId: string) {
    const provincia = await this.prisma.provincia.findUnique({
      where: { id: provinciaId },
    });

    if (!provincia) {
      throw new BadRequestException('Invalid provincia');
    }

    const canton = await this.prisma.canton.findFirst({
      where: {
        id: cantonId,
        provinciaId,
      },
    });

    if (!canton) {
      throw new BadRequestException('Invalid canton for the selected provincia');
    }

    const distrito = await this.prisma.distrito.findFirst({
      where: {
        id: distritoId,
        cantonId,
      },
    });

    if (!distrito) {
      throw new BadRequestException('Invalid distrito for the selected canton');
    }
  }
}
