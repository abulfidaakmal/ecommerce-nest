import { Module } from '@nestjs/common';
import { OrderSellerService } from './order-seller.service';
import { OrderSellerRepository } from './order-seller.repository';
import { OrderSellerController } from './order-seller.controller';
import { WishlistModule } from '../wishlist/wishlist.module';

@Module({
  imports: [WishlistModule],
  providers: [OrderSellerService, OrderSellerRepository],
  controllers: [OrderSellerController],
})
export class OrderSellerModule {}
