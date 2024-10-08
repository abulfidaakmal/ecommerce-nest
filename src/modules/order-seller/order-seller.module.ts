import { Module } from '@nestjs/common';
import { OrderSellerService } from './order-seller.service';
import { OrderSellerRepository } from './order-seller.repository';
import { OrderSellerController } from './order-seller.controller';

@Module({
  providers: [OrderSellerService, OrderSellerRepository],
  controllers: [OrderSellerController],
})
export class OrderSellerModule {}
