import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './infrastructure/http/admin.controller';
import { AdminCatalogService } from './application/admin-catalog.service';
import { AdminOrdersService } from './application/admin-orders.service';
import { AdminSettingsService } from './application/admin-settings.service';
import { AdminStaffService } from './application/admin-staff.service';

/**
 * Módulo Admin para Tenant Owners
 * Gestiona el dashboard del dueño del negocio:
 * - Catálogo de productos/servicios
 * - Órdenes y Kanban
 * - Estadísticas del dashboard
 * - Configuración del negocio (logo, banner, colores)
 * - Gestión de empleados (staff)
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
    AdminStaffService,
  ],
  exports: [
    AdminCatalogService,
    AdminOrdersService,
    AdminSettingsService,
    AdminStaffService,
  ],
})
export class AdminModule {}
