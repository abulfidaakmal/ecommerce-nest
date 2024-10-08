import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantRepository } from './merchant.repository';
import { MerchantController } from './merchant.controller';

@Module({
  providers: [MerchantService, MerchantRepository],
  controllers: [MerchantController],
  exports: [MerchantService],
})
export class MerchantModule {}
