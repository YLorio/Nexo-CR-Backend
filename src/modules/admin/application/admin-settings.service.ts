import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Servicio para gestionar la configuración del negocio
 * desde el panel de administración
 */
@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la configuración actual del negocio
   */
  async getSettings(tenantId: string) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id: tenantId },
      include: {
        banners: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
          take: 3,
        },
      },
    });

    if (!negocio) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Convertir banners a array de URLs
    const bannerUrls = negocio.banners.map(b => b.urlImagen);

    return {
      id: negocio.id,
      name: negocio.nombre,
      slug: negocio.slug,
      tagline: negocio.eslogan,
      whatsappNumber: negocio.whatsapp,
      email: negocio.email,
      primaryColor: negocio.colorPrimario,
      accentColor: negocio.colorSecundario,
      logoUrl: negocio.logo,
      bannerUrls,
      currency: negocio.moneda,
    };
  }

  /**
   * Actualiza la configuración del negocio
   */
  async updateSettings(
    tenantId: string,
    data: {
      name?: string;
      tagline?: string;
      whatsappNumber?: string;
      email?: string;
      primaryColor?: string;
      accentColor?: string;
      logoUrl?: string;
      bannerUrls?: string[];
    },
  ) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id: tenantId },
    });

    if (!negocio) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Validar máximo 3 banners
    if (data.bannerUrls && data.bannerUrls.length > 3) {
      throw new BadRequestException('Máximo 3 banners permitidos');
    }

    // Actualizar banners si se proporcionan
    if (data.bannerUrls !== undefined) {
      // Eliminar banners existentes
      await this.prisma.bannerNegocio.deleteMany({
        where: { negocioId: tenantId },
      });

      // Crear nuevos banners
      if (data.bannerUrls.length > 0) {
        await this.prisma.bannerNegocio.createMany({
          data: data.bannerUrls.map((url, index) => ({
            negocioId: tenantId,
            urlImagen: url,
            orden: index,
            activo: true,
          })),
        });
      }
    }

    const updated = await this.prisma.negocio.update({
      where: { id: tenantId },
      data: {
        ...(data.name && { nombre: data.name }),
        ...(data.tagline !== undefined && { eslogan: data.tagline || null }),
        ...(data.whatsappNumber && { whatsapp: data.whatsappNumber }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.primaryColor && { colorPrimario: data.primaryColor }),
        ...(data.accentColor && { colorSecundario: data.accentColor }),
        ...(data.logoUrl !== undefined && { logo: data.logoUrl || null }),
      },
      include: {
        banners: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
          take: 3,
        },
      },
    });

    return {
      id: updated.id,
      name: updated.nombre,
      slug: updated.slug,
      tagline: updated.eslogan,
      whatsappNumber: updated.whatsapp,
      email: updated.email,
      primaryColor: updated.colorPrimario,
      accentColor: updated.colorSecundario,
      logoUrl: updated.logo,
      bannerUrls: updated.banners.map(b => b.urlImagen),
      currency: updated.moneda,
    };
  }

  /**
   * Agrega un banner al array (si hay espacio)
   */
  async addBanner(tenantId: string, bannerUrl: string) {
    const existingBanners = await this.prisma.bannerNegocio.count({
      where: { negocioId: tenantId, activo: true },
    });

    if (existingBanners >= 3) {
      throw new BadRequestException('Máximo 3 banners permitidos');
    }

    await this.prisma.bannerNegocio.create({
      data: {
        negocioId: tenantId,
        urlImagen: bannerUrl,
        orden: existingBanners,
        activo: true,
      },
    });

    const banners = await this.prisma.bannerNegocio.findMany({
      where: { negocioId: tenantId, activo: true },
      orderBy: { orden: 'asc' },
    });

    const bannerUrls = banners.map(b => b.urlImagen);

    return { url: bannerUrl, bannerUrls };
  }

  /**
   * Elimina un banner del array
   */
  async removeBanner(tenantId: string, index: number) {
    const banners = await this.prisma.bannerNegocio.findMany({
      where: { negocioId: tenantId, activo: true },
      orderBy: { orden: 'asc' },
    });

    if (index < 0 || index >= banners.length) {
      throw new BadRequestException('Índice de banner inválido');
    }

    const bannerToDelete = banners[index];

    await this.prisma.bannerNegocio.delete({
      where: { id: bannerToDelete.id },
    });

    // Reordenar los restantes
    const remainingBanners = banners.filter((_, i) => i !== index);
    for (let i = 0; i < remainingBanners.length; i++) {
      await this.prisma.bannerNegocio.update({
        where: { id: remainingBanners[i].id },
        data: { orden: i },
      });
    }

    return { bannerUrls: remainingBanners.map(b => b.urlImagen) };
  }
}
