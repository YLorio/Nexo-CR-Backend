import { Module } from '@nestjs/common';
import { UserAddressesController } from './infrastructure/http/user-addresses.controller';
import { UserAddressesService } from './application/user-addresses.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserAddressesController],
  providers: [UserAddressesService],
  exports: [UserAddressesService],
})
export class UserAddressesModule {}
