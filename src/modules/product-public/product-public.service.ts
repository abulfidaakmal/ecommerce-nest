import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ProductPublicRepository } from './product-public.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { WishlistService } from '../wishlist/wishlist.service';
import { MerchantService } from '../merchant/merchant.service';
import {
  GetProductByCategoryRequest,
  ProductByIdResponse,
  ProductPublicResponse,
} from '../../model/product-public.model';
import { ResponseModel } from '../../model/response.model';
import { ValidationService } from '../../common/validation.service';
import { ProductPublicValidation } from './product-public.validation';
import { CategoryRepository } from '../category/category.repository';

@Injectable()
export class ProductPublicService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly productPublicRepository: ProductPublicRepository,
    private readonly wishlistService: WishlistService,
    private readonly merchantService: MerchantService,
    private readonly validationService: ValidationService,
    private readonly categoryRepository: CategoryRepository,
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

  async getByCategoryName(
    req: GetProductByCategoryRequest,
  ): Promise<ResponseModel<ProductPublicResponse[]>> {
    this.logger.info(
      `Get product by category name request: ${JSON.stringify(req)}`,
    );
    const getRequest: GetProductByCategoryRequest =
      this.validationService.validate(
        ProductPublicValidation.GETBYCATEGORY,
        req,
      );

    const isCategoryExists = await this.categoryRepository.isNameAlreadyExists(
      getRequest.category_name,
    );

    if (!isCategoryExists) {
      throw new HttpException('category is not found', 404);
    }

    const total_data =
      await this.productPublicRepository.getTotalProductByCategory(
        getRequest.category_name,
      );

    if (!total_data) {
      throw new HttpException('no product available', 404);
    }

    const current_page = getRequest.page;
    const size = getRequest.size;
    getRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const products =
      await this.productPublicRepository.getProductByCategory(getRequest);

    return {
      data: products,
      paging: {
        current_page,
        size,
        total_data,
        total_page,
      },
    };
  }
}
