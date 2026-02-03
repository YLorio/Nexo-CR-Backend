import { Module } from '@nestjs/common';
import { CatalogController } from './infrastructure/http';
import { GET_CATALOG_UC } from './application/ports/inbound';
import { GetCatalogUC } from './application/use-cases';
import { PrismaCatalogQueryRepository } from './infrastructure/persistence';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Módulo de Catálogo
 * Gestiona la consulta de productos, servicios y categorías
 */
@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [
    // Repositorios
    {
      provide: 'ICatalogQueryRepository',
      useFactory: (prisma: PrismaService) => new PrismaCatalogQueryRepository(prisma),
      inject: [PrismaService],
    },
    // Casos de uso
    {
      provide: GET_CATALOG_UC,
      useFactory: (catalogQueryRepo: PrismaCatalogQueryRepository) =>
        new GetCatalogUC(catalogQueryRepo),
      inject: ['ICatalogQueryRepository'],
    },
  ],
  exports: [GET_CATALOG_UC],
})
export class CatalogModule {}
