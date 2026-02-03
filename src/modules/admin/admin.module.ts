import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './infrastructure/http/admin.controller';
import { AdminCatalogService } from './application/admin-catalog.service';
import { AdminOrdersService } from './application/admin-orders.service';
import { AdminSettingsService } from './application/admin-settings.service';
<<<<<<< HEAD
=======
import { AdminStaffService } from './application/admin-staff.service';
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d

/**
 * Módulo Admin para Tenant Owners
 * Gestiona el dashboard del dueño del negocio:
<<<<<<< HEAD
 * - Catálogo de productos
 * - Órdenes y Kanban
 * - Estadísticas del dashboard
 * - Configuración del negocio (logo, banner, colores)
=======
 * - Catálogo de productos/servicios
 * - Órdenes y Kanban
 * - Estadísticas del dashboard
 * - Configuración del negocio (logo, banner, colores)
 * - Gestión de empleados (staff)
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
<<<<<<< HEAD
=======
    AdminStaffService,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  ],
  exports: [
    AdminCatalogService,
    AdminOrdersService,
    AdminSettingsService,
<<<<<<< HEAD
=======
    AdminStaffService,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  ],
})
export class AdminModule {}
