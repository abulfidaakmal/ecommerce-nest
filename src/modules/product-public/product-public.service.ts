import { Inject, Injectable } from '@nestjs/common';
import { ProductPublicRepository } from './product-public.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { WishlistService } from '../wishlist/wishlist.service';
import { MerchantService } from '../merchant/merchant.service';
import { ProductByIdResponse } from '../../model/product-public.model';

@Injectable()
export class ProductPublicService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly productPublicRepository: ProductPublicRepository,
    private readonly wishlistService: WishlistService,
    private readonly merchantService: MerchantService,
  ) {}

  async getById(product_id: number): Promise<ProductByIdResponse> {
    this.logger.info(`Get product by id request: ${product_id}`);

    await this.wishlistService.isProductExists(product_id);

    const product = await this.productPublicRepository.getById(product_id);

    const rating = await this.productPublicRepository.getRating(product_id);
    const sold = await this.productPublicRepository.getSold(product_id);

    const seller = product.users.sellers;
    const ratingInfo = await this.merchantService.ratingInfo(seller.name);

    return {
      product: {
        id: product_id,
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        price: product.price,
        stock: product.stock,
        weight: product.weight,
        condition: product.condition,
        sku: product.sku,
        category_name: product.categories.name,
        total_rating: rating,
        total_sold: sold,
      },
      seller: {
        name: seller.name,
        avatar: seller.users.avatar,
        city: seller.addresses.city,
        province: seller.addresses.province,
        rating_percentage: ratingInfo.ratingPercentage,
      },
    };
  }
}
