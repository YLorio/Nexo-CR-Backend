import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
<<<<<<< HEAD
 * Servicio para gestionar la configuración del negocio
=======
 * Servicio para gestionar la configuración del negocio (Tenant)
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
 * desde el panel de administración
 */
@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
<<<<<<< HEAD
   * Obtiene la configuración actual del negocio
   */
  async getSettings(tenantId: string) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id: tenantId },
      include: {
        banners: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
=======
   * Obtiene la configuración actual del tenant
   */
  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        banners: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
          take: 3,
        },
      },
    });

<<<<<<< HEAD
    if (!negocio) {
=======
    if (!tenant) {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      throw new NotFoundException('Negocio no encontrado');
    }

    // Convertir banners a array de URLs
<<<<<<< HEAD
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
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    };
  }

  /**
<<<<<<< HEAD
   * Actualiza la configuración del negocio
=======
   * Actualiza la configuración del tenant
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
   */
  async updateSettings(
    tenantId: string,
    data: {
      name?: string;
<<<<<<< HEAD
      tagline?: string;
=======
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      whatsappNumber?: string;
      email?: string;
      primaryColor?: string;
      accentColor?: string;
      logoUrl?: string;
      bannerUrls?: string[];
    },
  ) {
<<<<<<< HEAD
    const negocio = await this.prisma.negocio.findUnique({
      where: { id: tenantId },
    });

    if (!negocio) {
=======
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      throw new NotFoundException('Negocio no encontrado');
    }

    // Validar máximo 3 banners
    if (data.bannerUrls && data.bannerUrls.length > 3) {
      throw new BadRequestException('Máximo 3 banners permitidos');
    }

    // Actualizar banners si se proporcionan
    if (data.bannerUrls !== undefined) {
      // Eliminar banners existentes
<<<<<<< HEAD
      await this.prisma.bannerNegocio.deleteMany({
        where: { negocioId: tenantId },
=======
      await this.prisma.tenantBanner.deleteMany({
        where: { tenantId },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      });

      // Crear nuevos banners
      if (data.bannerUrls.length > 0) {
<<<<<<< HEAD
        await this.prisma.bannerNegocio.createMany({
          data: data.bannerUrls.map((url, index) => ({
            negocioId: tenantId,
            urlImagen: url,
            orden: index,
            activo: true,
=======
        await this.prisma.tenantBanner.createMany({
          data: data.bannerUrls.map((url, index) => ({
            tenantId,
            imageUrl: url,
            sortOrder: index,
            isActive: true,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
          })),
        });
      }
    }

<<<<<<< HEAD
    const updated = await this.prisma.negocio.update({
      where: { id: tenantId },
      data: {
        ...(data.name && { nombre: data.name }),
        ...(data.tagline !== undefined && { eslogan: data.tagline || null }),
        ...(data.whatsappNumber && { whatsapp: data.whatsappNumber }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.primaryColor && { colorPrimario: data.primaryColor }),
        ...(data.accentColor && { colorSecundario: data.accentColor }),
=======
    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.whatsappNumber && { whatsappNumber: data.whatsappNumber }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.primaryColor && { primaryColor: data.primaryColor }),
        ...(data.accentColor && { accentColor: data.accentColor }),
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
        ...(data.logoUrl !== undefined && { logo: data.logoUrl || null }),
      },
      include: {
        banners: {
<<<<<<< HEAD
          where: { activo: true },
          orderBy: { orden: 'asc' },
=======
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
          take: 3,
        },
      },
    });

    return {
      id: updated.id,
<<<<<<< HEAD
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
=======
      name: updated.name,
      slug: updated.slug,
      whatsappNumber: updated.whatsappNumber,
      email: updated.email,
      primaryColor: updated.primaryColor,
      accentColor: updated.accentColor,
      logoUrl: updated.logo,
      bannerUrls: updated.banners.map(b => b.imageUrl),
      currency: updated.defaultCurrency,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    };
  }

  /**
   * Agrega un banner al array (si hay espacio)
   */
  async addBanner(tenantId: string, bannerUrl: string) {
<<<<<<< HEAD
    const existingBanners = await this.prisma.bannerNegocio.count({
      where: { negocioId: tenantId, activo: true },
=======
    const existingBanners = await this.prisma.tenantBanner.count({
      where: { tenantId, isActive: true },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    });

    if (existingBanners >= 3) {
      throw new BadRequestException('Máximo 3 banners permitidos');
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

    return { url: bannerUrl, bannerUrls };
  }

  /**
   * Elimina un banner del array
   */
  async removeBanner(tenantId: string, index: number) {
<<<<<<< HEAD
    const banners = await this.prisma.bannerNegocio.findMany({
      where: { negocioId: tenantId, activo: true },
      orderBy: { orden: 'asc' },
=======
    const banners = await this.prisma.tenantBanner.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    });

    if (index < 0 || index >= banners.length) {
      throw new BadRequestException('Índice de banner inválido');
    }

    const bannerToDelete = banners[index];

<<<<<<< HEAD
    await this.prisma.bannerNegocio.delete({
=======
    await this.prisma.tenantBanner.delete({
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      where: { id: bannerToDelete.id },
    });

    // Reordenar los restantes
    const remainingBanners = banners.filter((_, i) => i !== index);
    for (let i = 0; i < remainingBanners.length; i++) {
<<<<<<< HEAD
      await this.prisma.bannerNegocio.update({
        where: { id: remainingBanners[i].id },
        data: { orden: i },
      });
    }

    return { bannerUrls: remainingBanners.map(b => b.urlImagen) };
=======
      await this.prisma.tenantBanner.update({
        where: { id: remainingBanners[i].id },
        data: { sortOrder: i },
      });
    }

    return { bannerUrls: remainingBanners.map(b => b.imageUrl) };
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  }
}
