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
  ProductReviewRequest,
  ProductReviewResponse,
  RatingDistributionResponse,
  SearchProductRequest,
} from '../../model/product-public.model';
import { ResponseModel } from '../../model/response.model';
import { ValidationService } from '../../common/validation.service';
import { ProductPublicValidation } from './product-public.validation';
import { CategoryRepository } from '../category/category.repository';
import { ElasticService } from '../elastic/elastic.service';

@Injectable()
export class ProductPublicService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly productPublicRepository: ProductPublicRepository,
    private readonly wishlistService: WishlistService,
    private readonly merchantService: MerchantService,
    private readonly validationService: ValidationService,
    private readonly categoryRepository: CategoryRepository,
    private readonly elasticService: ElasticService,
  ) {}

  async isReviewExists(product_id: number): Promise<number> {
    const check = await this.productPublicRepository.getReview(product_id);

    if (!check) {
      throw new HttpException('no review available', 404);
    }

    return check;
  }

  async getById(product_id: number): Promise<ProductByIdResponse> {
    this.logger.info(`Get product by id request: ${product_id}`);

    await this.wishlistService.isProductExists(product_id);

    const product = await this.productPublicRepository.getById(product_id);

    const review = await this.productPublicRepository.getReview(product_id);
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
        total_review: review,
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

  async getAllReview(
    req: ProductReviewRequest,
  ): Promise<ResponseModel<ProductReviewResponse[]>> {
    this.logger.info(
      `Get all review by product id request: ${JSON.stringify(req)}`,
    );
    const getAllRequest: ProductReviewRequest = this.validationService.validate(
      ProductPublicValidation.GETREVIEW,
      req,
    );

    const product_id = getAllRequest.product_id;

    await this.wishlistService.isProductExists(product_id);

    const total_data = await this.isReviewExists(product_id);

    const current_page = getAllRequest.page;
    const size = getAllRequest.size;
    getAllRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const reviews = await this.productPublicRepository.getAll(getAllRequest);

    const result = reviews.map((review) => {
      return {
        id: review.id,
        rating: review.rating,
        summary: review.summary,
        image_url: review.image_url,
        username: review.users.username,
        avatar: review.users.avatar,
        created_at: review.created_at,
        updated_at: review.updated_at,
      };
    });

    return {
      data: result,
      paging: {
        current_page,
        size,
        total_data,
        total_page,
      },
    };
  }

  async getRatingDistribution(
    product_id: number,
  ): Promise<RatingDistributionResponse> {
    this.logger.info(`Get rating distribution request: ${product_id}`);

    await this.wishlistService.isProductExists(product_id);
    const total_data = await this.isReviewExists(product_id);

    const ratingInfo =
      await this.productPublicRepository.getRatingInfo(product_id);

    const average = ratingInfo._avg.rating;

    const ratingPercentage = `${((average / 5) * 100).toFixed(0)}%`;
    const ratingAverage = parseFloat(average.toFixed(1));

    const ratings = await Promise.all(
      [5, 4, 3, 2, 1].map(async (rating) => {
        const totalRating =
          await this.productPublicRepository.getTotalRatingByRating(
            product_id,
            rating,
          );

        return {
          rating: rating,
          total: totalRating,
        };
      }),
    );

    return {
      percentage: ratingPercentage,
      average: ratingAverage,
      total_rating: ratingInfo._sum.rating,
      total_review: total_data,
      ratings,
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

  async search(
    req: SearchProductRequest,
  ): Promise<ResponseModel<ProductPublicResponse[]>> {
    this.logger.info(`Search product request: ${JSON.stringify(req)}`);

    const searchRequest: SearchProductRequest = this.validationService.validate(
      ProductPublicValidation.SEARCH,
      req,
    );

    const current_page = searchRequest.page;
    const size = searchRequest.size;
    searchRequest.page = (current_page - 1) * size;

    let total_data: number;
    let result: ProductPublicResponse[];

    if (searchRequest.search) {
      total_data = await this.elasticService.getTotalData(searchRequest.search);

      if (!total_data) {
        throw new HttpException('product is not found', 404);
      }

      const searchResult = await this.elasticService.search(searchRequest);

      const products = searchResult.hits.hits;

      result = products.map((hit: any) => ({
        id: hit._id,
        name: hit._source.name,
        price: Number(hit._source.price),
        image_url: hit._source.image_url,
      }));
    } else {
      total_data =
        await this.productPublicRepository.getTotalDataProductPopular();

      if (!total_data) {
        throw new HttpException('no product available', 404);
      }

      const products: any =
        await this.productPublicRepository.getProductPopular(searchRequest);

      result = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
      }));
    }

    const total_page = Math.ceil(total_data / size);

    return {
      data: result,
      paging: {
        current_page,
        size,
        total_data,
        total_page,
      },
    };
  }
}
