import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener todas las provincias con sus cantones y distritos
   */
  async getAllProvincias() {
    return this.prisma.provincia.findMany({
      include: {
        cantones: {
          include: {
            distritos: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Obtener todas las provincias sin relaciones (solo lista)
   */
  async getProvincias() {
    return this.prisma.provincia.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Obtener cantones de una provincia
   */
  async getCantonesByProvincia(provinciaId: string) {
    return this.prisma.canton.findMany({
      where: { provinciaId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Obtener distritos de un cantón
   */
  async getDistritosByCanton(cantonId: string) {
    return this.prisma.distrito.findMany({
      where: { cantonId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
