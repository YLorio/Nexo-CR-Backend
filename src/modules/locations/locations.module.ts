import { Module } from '@nestjs/common';
import { LocationsController } from './infrastructure/http/locations.controller';
import { LocationsService } from './application/locations.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
