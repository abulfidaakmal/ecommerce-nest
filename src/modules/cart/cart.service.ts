import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CartRepository } from './cart.repository';
import { ValidationService } from '../../common/validation.service';
import { WishlistService } from '../wishlist/wishlist.service';
import {
  CartResponse,
  CreateCartRequest,
  GetAllCartRequest,
  UpdateCartRequest,
} from '../../model/cart.model';
import { CartValidation } from './cart.validation';
import { ResponseModel } from '../../model/response.model';

@Injectable()
export class CartService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly cartRepository: CartRepository,
    private readonly validationService: ValidationService,
    private readonly wishlistService: WishlistService,
  ) {}

  async isCartExists(username: string, product_id: number): Promise<void> {
    const check = await this.cartRepository.isCartExists(username, product_id);

    if (!check) {
      throw new HttpException('cart is not found', 404);
    }
  }

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

  async getAll(
    username: string,
    req: GetAllCartRequest,
  ): Promise<ResponseModel<CartResponse[]>> {
    this.logger.info(`Get all cart request: ${JSON.stringify(req)}`);
    const getAllRequest: GetAllCartRequest = this.validationService.validate(
      CartValidation.GET,
      req,
    );

    const total_data = await this.cartRepository.getTotalCart(username);

    if (!total_data) {
      throw new HttpException('no cart available', 404);
    }

    const current_page = getAllRequest.page;
    const size = getAllRequest.size;
    getAllRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const carts = await this.cartRepository.getAll(username, getAllRequest);
    const result = carts.map((cart) => {
      const price = cart.products.price;

      return this.toCartResponse(cart, price);
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

  async update(
    username: string,
    req: UpdateCartRequest,
  ): Promise<CartResponse> {
    this.logger.info(`Update cart request: ${JSON.stringify(req)}`);
    const updateRequest: UpdateCartRequest = this.validationService.validate(
      CartValidation.UPDATE,
      req,
    );

    const cart_id = updateRequest.cart_id;

    await this.isCartExists(username, cart_id);

    const productId = await this.cartRepository.getProductId(username, cart_id);

    const product = await this.cartRepository.getProductPrice(productId);

    const existingCart = await this.cartRepository.existingCart(
      username,
      productId,
    );

    updateRequest.quantity += existingCart.quantity;

    const price = product.price;

    const cart = await this.cartRepository.update(
      username,
      updateRequest,
      price,
    );

    return this.toCartResponse(cart, price);
  }

  async remove(username: string, cart_id: number): Promise<string> {
    this.logger.info(`Remove cart request: ${cart_id}`);

    await this.isCartExists(username, cart_id);

    await this.cartRepository.remove(username, cart_id);

    return 'OK';
  }
}
