import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { CartController } from './cart.controller';
import { WishlistModule } from '../wishlist/wishlist.module';

@Module({
  imports: [WishlistModule],
  providers: [CartService, CartRepository],
  controllers: [CartController],
})
export class CartModule {}
