import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminPagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la configuración de la página de inicio
   */
  async getHomePageConfig(tenantId: string) {
    const page = await this.prisma.pageConfig.findFirst({
      where: {
        tenantId,
        isHome: true,
      },
    });

    if (!page) {
      // Si no existe, devolver una configuración por defecto
      return this.createDefaultHomePage(tenantId);
    }

    return page;
  }

  /**
   * Actualiza la configuración de la página de inicio
   */
  async updateHomePageConfig(tenantId: string, config: any) {
    // Buscar si existe
    const existingPage = await this.prisma.pageConfig.findFirst({
      where: {
        tenantId,
        isHome: true,
      },
    });

    if (existingPage) {
      return this.prisma.pageConfig.update({
        where: { id: existingPage.id },
        data: {
          config: config as any, // JSON
        },
      });
    } else {
      return this.prisma.pageConfig.create({
        data: {
          tenantId,
          slug: 'home',
          title: 'Inicio',
          isHome: true,
          config: config as any,
        },
      });
    }
  }

  /**
   * Crea una configuración por defecto si no existe
   */
  private async createDefaultHomePage(tenantId: string) {
    const defaultConfig = {
      sections: [
        {
          id: 'sec-hero',
          type: 'HERO',
          isVisible: true,
          props: {
            title: 'Bienvenido a nuestra tienda',
            subtitle: 'Encuentra los mejores productos aquí',
            buttonText: 'Ver Catálogo',
            height: 'medium',
            alignment: 'center',
          },
        },
        {
          id: 'sec-products',
          type: 'PRODUCT_GRID',
          isVisible: true,
          props: {
            title: 'Nuestros Productos',
            limit: 4,
            columns: 4,
          },
        },
      ],
    };

    return this.prisma.pageConfig.create({
      data: {
        tenantId,
        slug: 'home',
        title: 'Inicio',
        isHome: true,
        config: defaultConfig as any,
      },
    });
  }
}
