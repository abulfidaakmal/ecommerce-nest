import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CartRepository } from './cart.repository';
import { ValidationService } from '../../common/validation.service';
import { WishlistService } from '../wishlist/wishlist.service';
import { CartResponse, CreateCartRequest } from '../../model/cart.model';
import { CartValidation } from './cart.validation';

@Injectable()
export class CartService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly cartRepository: CartRepository,
    private readonly validationService: ValidationService,
    private readonly wishlistService: WishlistService,
  ) {}

  private toCartResponse(cart, price: number): CartResponse {
    const product = cart.products;

    return {
      cart: {
        id: cart.id,
        quantity: cart.quantity,
        total: cart.total,
      },
      product: {
        id: product.id,
        name: product.name,
        price: price,
        stock: product.stock,
        image_url: product.image_url,
        seller_name: product.users.sellers.name,
      },
      created_at: cart.created_at,
      updated_at: cart.updated_at,
    };
  }

  async create(
    username: string,
    req: CreateCartRequest,
  ): Promise<CartResponse> {
    this.logger.info(`Create cart request: ${JSON.stringify(req)}`);
    const createRequest: CreateCartRequest = this.validationService.validate(
      CartValidation.CREATE,
      req,
    );

    const product_id = createRequest.product_id;

    await this.wishlistService.isProductExists(product_id);

    const existingCart = await this.cartRepository.existingCart(
      username,
      product_id,
    );

    const product = await this.cartRepository.getProductPrice(product_id);
    const price = product.price;

    if (existingCart) {
      createRequest.quantity = createRequest.quantity + existingCart.quantity;

      const updateRequest = {
        quantity: createRequest.quantity,
        cart_id: existingCart.id,
      };

      const cart = await this.cartRepository.update(
        username,
        updateRequest,
        price,
      );

      return this.toCartResponse(cart, price);
    }

    const cart = await this.cartRepository.create(
      username,
      createRequest,
      price,
    );

    return this.toCartResponse(cart, price);
  }
}
