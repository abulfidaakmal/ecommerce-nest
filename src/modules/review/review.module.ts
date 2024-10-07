import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';
import { ReviewController } from './review.controller';
import { WishlistModule } from '../wishlist/wishlist.module';

@Module({
  imports: [WishlistModule],
  providers: [ReviewService, ReviewRepository],
  controllers: [ReviewController],
})
export class ReviewModule {}
