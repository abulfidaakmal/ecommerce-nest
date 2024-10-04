import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { WishlistRepository } from './wishlist.repository';
import {
  CreateWishlistRequest,
  WishlistResponse,
} from '../../model/wishlist.model';
import { ValidationService } from '../../common/validation.service';
import { WishlistValidation } from './wishlist.validation';

@Injectable()
export class WishlistService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async isProductExists(product_id: number): Promise<void> {
    const check = await this.wishlistRepository.isProductExists(product_id);

    if (!check) {
      throw new HttpException('product is not found', 404);
    }
  }

  private toWishlistResponse(wishlist): WishlistResponse {
    const { id, name, price, image_url } = wishlist.products;

    return {
      id: wishlist.id,
      product_id: id,
      name,
      price,
      image_url,
      created_at: wishlist.created_at,
      updated_at: wishlist.updated_at,
    };
  }

  async create(
    username: string,
    req: CreateWishlistRequest,
  ): Promise<WishlistResponse> {
    this.logger.info(`Create wishlist request: ${JSON.stringify(req)}`);
    const createRequest: CreateWishlistRequest =
      this.validationService.validate(WishlistValidation.CREATE, req);

    const product_id = createRequest.product_id;

    await this.isProductExists(product_id);

    const existingWishlist = await this.wishlistRepository.existingWishlist(
      username,
      product_id,
    );

    if (existingWishlist) {
      throw new HttpException('product already on the wishlist', 409);
    }

    const wishlist = await this.wishlistRepository.create(username, product_id);

    return this.toWishlistResponse(wishlist);
  }
}
