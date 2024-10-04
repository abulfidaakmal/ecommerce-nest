import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { WishlistRepository } from './wishlist.repository';
import {
  CreateWishlistRequest,
  GetAllWishlistRequest,
  WishlistResponse,
} from '../../model/wishlist.model';
import { ValidationService } from '../../common/validation.service';
import { WishlistValidation } from './wishlist.validation';
import { ResponseModel } from '../../model/response.model';

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

  async getAll(
    username: string,
    req: GetAllWishlistRequest,
  ): Promise<ResponseModel<WishlistResponse[]>> {
    this.logger.info(`Get all wishlist request: ${username}`);
    const getRequest: GetAllWishlistRequest = this.validationService.validate(
      WishlistValidation.GET,
      req,
    );

    const total_data = await this.wishlistRepository.getTotalWishlist(username);

    if (!total_data) {
      throw new HttpException('no wishlist available', 404);
    }

    const current_page = getRequest.page;
    const size = getRequest.size;
    getRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const wishlists = await this.wishlistRepository.getAll(
      username,
      getRequest,
    );
    const result = wishlists.map((wishlist) => {
      return this.toWishlistResponse(wishlist);
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

  async remove(username: string, wishlist_id: number): Promise<string> {
    this.logger.info(`Remove wishlist request: ${wishlist_id}`);

    const isWishlistExists = await this.wishlistRepository.isWishlistExists(
      username,
      wishlist_id,
    );

    if (!isWishlistExists) {
      throw new HttpException('wishlist is not found', 404);
    }

    await this.wishlistRepository.remove(username, wishlist_id);

    return 'OK';
  }
}
