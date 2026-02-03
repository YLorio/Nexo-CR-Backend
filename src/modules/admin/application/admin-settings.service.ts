import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Servicio para gestionar la configuración del negocio (Tenant)
 * desde el panel de administración
 */
@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la configuración actual del tenant
   */
  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        banners: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 3,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Convertir banners a array de URLs
    const bannerUrls = tenant.banners.map(b => b.imageUrl);

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      whatsappNumber: tenant.whatsappNumber,
      email: tenant.email,
      primaryColor: tenant.primaryColor,
      accentColor: tenant.accentColor,
      logoUrl: tenant.logo,
      bannerUrls,
      currency: tenant.defaultCurrency,
    };
  }

  /**
   * Actualiza la configuración del tenant
   */
  async updateSettings(
    tenantId: string,
    data: {
      name?: string;
      whatsappNumber?: string;
      email?: string;
      primaryColor?: string;
      accentColor?: string;
      logoUrl?: string;
      bannerUrls?: string[];
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Validar máximo 3 banners
    if (data.bannerUrls && data.bannerUrls.length > 3) {
      throw new BadRequestException('Máximo 3 banners permitidos');
    }

    // Actualizar banners si se proporcionan
    if (data.bannerUrls !== undefined) {
      // Eliminar banners existentes
      await this.prisma.tenantBanner.deleteMany({
        where: { tenantId },
      });

      // Crear nuevos banners
      if (data.bannerUrls.length > 0) {
        await this.prisma.tenantBanner.createMany({
          data: data.bannerUrls.map((url, index) => ({
            tenantId,
            imageUrl: url,
            sortOrder: index,
            isActive: true,
          })),
        });
      }
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.whatsappNumber && { whatsappNumber: data.whatsappNumber }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.primaryColor && { primaryColor: data.primaryColor }),
        ...(data.accentColor && { accentColor: data.accentColor }),
        ...(data.logoUrl !== undefined && { logo: data.logoUrl || null }),
      },
      include: {
        banners: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 3,
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      whatsappNumber: updated.whatsappNumber,
      email: updated.email,
      primaryColor: updated.primaryColor,
      accentColor: updated.accentColor,
      logoUrl: updated.logo,
      bannerUrls: updated.banners.map(b => b.imageUrl),
      currency: updated.defaultCurrency,
    };
  }

  /**
   * Agrega un banner al array (si hay espacio)
   */
  async addBanner(tenantId: string, bannerUrl: string) {
    const existingBanners = await this.prisma.tenantBanner.count({
      where: { tenantId, isActive: true },
    });

    if (existingBanners >= 3) {
      throw new BadRequestException('Máximo 3 banners permitidos');
    }

    await this.prisma.tenantBanner.create({
      data: {
        tenantId,
        imageUrl: bannerUrl,
        sortOrder: existingBanners,
        isActive: true,
      },
    });

    const banners = await this.prisma.tenantBanner.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const bannerUrls = banners.map(b => b.imageUrl);

    return { url: bannerUrl, bannerUrls };
  }

  /**
   * Elimina un banner del array
   */
  async removeBanner(tenantId: string, index: number) {
    const banners = await this.prisma.tenantBanner.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (index < 0 || index >= banners.length) {
      throw new BadRequestException('Índice de banner inválido');
    }

    const bannerToDelete = banners[index];

    await this.prisma.tenantBanner.delete({
      where: { id: bannerToDelete.id },
    });

    // Reordenar los restantes
    const remainingBanners = banners.filter((_, i) => i !== index);
    for (let i = 0; i < remainingBanners.length; i++) {
      await this.prisma.tenantBanner.update({
        where: { id: remainingBanners[i].id },
        data: { sortOrder: i },
      });
    }

    return { bannerUrls: remainingBanners.map(b => b.imageUrl) };
  }
}
