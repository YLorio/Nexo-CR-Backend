import { Module } from '@nestjs/common';
import { PlatformController } from './infrastructure/http/platform.controller';
import { PlatformService } from './application/platform.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
