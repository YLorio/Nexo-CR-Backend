import { Module } from '@nestjs/common';
import { TenantController } from './infrastructure/http';
import { GET_TENANT_BY_SLUG_UC } from './application/ports/inbound';
import { GetTenantBySlugUC } from './application/use-cases';
import { PrismaTenantQueryRepository } from './infrastructure/persistence';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Módulo de Tenant
 * Gestiona la información pública de los negocios (tema, logo, contacto)
 */
@Module({
  imports: [PrismaModule],
  controllers: [TenantController],
  providers: [
    // Repositorios
    {
      provide: 'ITenantQueryRepository',
      useFactory: (prisma: PrismaService) => new PrismaTenantQueryRepository(prisma),
      inject: [PrismaService],
    },
    // Casos de uso
    {
      provide: GET_TENANT_BY_SLUG_UC,
      useFactory: (tenantQueryRepo: PrismaTenantQueryRepository) =>
        new GetTenantBySlugUC(tenantQueryRepo),
      inject: ['ITenantQueryRepository'],
    },
  ],
  exports: [GET_TENANT_BY_SLUG_UC],
})
export class TenantModule {}
