import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ReviewRepository } from './review.repository';
import { ValidationService } from '../../common/validation.service';
import {
  CreateReviewRequest,
  GetAllReviewRequest,
  ReviewResponse,
} from '../../model/review.model';
import { ReviewValidation } from './review.validation';
import { WishlistService } from '../wishlist/wishlist.service';
import { Status } from '@prisma/client';
import { ResponseModel } from '../../model/response.model';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly reviewRepository: ReviewRepository,
    private readonly validationService: ValidationService,
    private readonly wishlistService: WishlistService,
  ) {}

  private toReviewResponse(review): ReviewResponse {
    const product = review.products;

    return {
      id: review.id,
      rating: review.rating,
      image_url: review.image_url,
      summary: review.summary,
      product_id: review.product_id,
      product_name: product.name,
      product_image: product.image_url,
      created_at: review.created_at,
      updated_at: review.updated_at,
    };
  }

  async create(
    username: string,
    req: CreateReviewRequest,
  ): Promise<ReviewResponse> {
    this.logger.info(`Create review request: ${JSON.stringify(req)}`);
    const createRequest: CreateReviewRequest = this.validationService.validate(
      ReviewValidation.CREATE,
      req,
    );

    const product_id = createRequest.product_id;

    await this.wishlistService.isProductExists(product_id);

    const order = await this.reviewRepository.isOrderExists(
      username,
      product_id,
    );

    if (!order) {
      throw new HttpException('forbidden', 403);
    }

    if (order.status !== Status.DELIVERED) {
      throw new HttpException(
        'cannot review if the order has not been delivered',
        400,
      );
    }

    const existingReview = await this.reviewRepository.existingReview(
      username,
      product_id,
    );

    if (existingReview) {
      throw new HttpException('you has already reviewed this product', 409);
    }

    const review = await this.reviewRepository.create(username, createRequest);

    return this.toReviewResponse(review);
  }

  async getAll(
    username: string,
    req: GetAllReviewRequest,
  ): Promise<ResponseModel<ReviewResponse[]>> {
    this.logger.info(`Get all review request: ${JSON.stringify(req)}`);
    const getAllRequest: GetAllReviewRequest = this.validationService.validate(
      ReviewValidation.GET,
      req,
    );

    const total_data = await this.reviewRepository.getTotalReview(username);

    if (!total_data) {
      throw new HttpException('no reviews available', 404);
    }

    const current_page = getAllRequest.page;
    const size = getAllRequest.size;
    getAllRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const reviews = await this.reviewRepository.getAll(username, getAllRequest);
    const result = reviews.map((review) => {
      return this.toReviewResponse(review);
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
}
