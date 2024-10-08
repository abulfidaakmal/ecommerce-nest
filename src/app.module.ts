import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { AddressModule } from './modules/address/address.module';
import { SellerModule } from './modules/seller/seller.module';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './common/role.guard';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { ReviewModule } from './modules/review/review.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { ProductPublicModule } from './modules/product-public/product-public.module';
import { OrderSellerModule } from './modules/order-seller/order-seller.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    UserModule,
    AuthModule,
    AddressModule,
    SellerModule,
    CategoryModule,
    ProductModule,
    WishlistModule,
    CartModule,
    OrderModule,
    ReviewModule,
    MerchantModule,
    ProductPublicModule,
    OrderSellerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
