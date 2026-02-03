import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './infrastructure/http/admin.controller';
import { AdminCatalogService } from './application/admin-catalog.service';
import { AdminOrdersService } from './application/admin-orders.service';
import { AdminSettingsService } from './application/admin-settings.service';

/**
 * Módulo Admin para Tenant Owners
 * Gestiona el dashboard del dueño del negocio:
 * - Catálogo de productos
 * - Órdenes y Kanban
 * - Estadísticas del dashboard
 * - Configuración del negocio (logo, banner, colores)
 *
 * SEGURIDAD: Todos los endpoints filtran por tenantId del JWT
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule, // Para guards y decoradores
  ],
  controllers: [AdminController],
  providers: [
    AdminCatalogService,
    AdminOrdersService,
    AdminSettingsService,
  ],
  exports: [
    AdminCatalogService,
    AdminOrdersService,
    AdminSettingsService,
  ],
})
export class AdminModule {}
