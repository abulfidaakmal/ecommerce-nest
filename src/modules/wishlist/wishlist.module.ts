import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';
import { WishlistController } from './wishlist.controller';

@Module({
  providers: [WishlistService, WishlistRepository],
  controllers: [WishlistController],
  exports: [WishlistService],
})
export class WishlistModule {}
