import { Module } from '@nestjs/common';
import { ProductPublicService } from './product-public.service';
import { ProductPublicRepository } from './product-public.repository';
import { ProductPublicController } from './product-public.controller';
import { WishlistModule } from '../wishlist/wishlist.module';
import { MerchantModule } from '../merchant/merchant.module';
import { CategoryModule } from '../category/category.module';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [WishlistModule, MerchantModule, CategoryModule, ElasticModule],
  providers: [ProductPublicService, ProductPublicRepository],
  controllers: [ProductPublicController],
})
export class ProductPublicModule {}
