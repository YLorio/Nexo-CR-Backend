import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global de Prisma
 * Se marca como @Global para que PrismaService esté disponible
 * en todos los módulos sin necesidad de importarlo explícitamente
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
