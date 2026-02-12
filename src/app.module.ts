import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Módulos de infraestructura
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './modules/storage';

// Módulos de dominio
import { BookingModule } from './modules/booking/booking.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlatformModule } from './modules/platform/platform.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserAddressesModule } from './modules/user-addresses/user-addresses.module';
import { LocationsModule } from './modules/locations/locations.module';

// Filtros de excepciones
import { DomainExceptionFilter } from './modules/shared/infrastructure/filters';

/**
 * Módulo principal de la aplicación NexoCR
 */
@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting: 100 requests por minuto por IP
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 segundo
        limit: 3,     // 3 requests por segundo (protección contra burst)
      },
      {
        name: 'medium',
        ttl: 10000,   // 10 segundos
        limit: 20,    // 20 requests por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000,   // 1 minuto
        limit: 100,   // 100 requests por minuto
      },
    ]),

    // Infraestructura
    PrismaModule,
    StorageModule,

    // Módulos de negocio
    AuthModule,
    PlatformModule,
    AdminModule,      // Tenant Dashboard (TENANT_OWNER)
    BookingModule,
    OrdersModule,
    TenantModule,
    CatalogModule,
    UserAddressesModule,
    LocationsModule,
  ],
  providers: [
    // Rate Limiting Guard Global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Validación global de DTOs
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,           // Elimina propiedades no definidas en el DTO
        forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
        transform: true,            // Transforma los tipos automáticamente
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
    // Filtro global de errores de dominio
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
