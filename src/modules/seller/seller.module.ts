import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerRepository } from './seller.repository';
import { SellerController } from './seller.controller';
import { AddressModule } from '../address/address.module';

@Module({
  imports: [AddressModule],
  providers: [SellerService, SellerRepository],
  controllers: [SellerController],
})
export class SellerModule {}
