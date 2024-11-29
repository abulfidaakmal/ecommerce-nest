import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { OrderSellerRepository } from './order-seller.repository';
import {
  GetOrderDetailRequest,
  OrderSellerDetailResponse,
  OrderSellerResponse,
  SearchOrderSellerRequest,
  UpdateOrderSellerRequest,
} from '../../model/order-seller.model';
import { ResponseModel } from '../../model/response.model';
import { ValidationService } from '../../common/validation.service';
import { OrderSellerValidation } from './order-seller.validation';
import { WishlistService } from '../wishlist/wishlist.service';

@Injectable()
export class OrderSellerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly orderSellerRepository: OrderSellerRepository,
    private readonly validationService: ValidationService,
    private readonly wishlistService: WishlistService,
  ) {}

  private toOrderSellerResponse(order): OrderSellerResponse {
    const product = order.products;

    return {
      order: {
        id: order.orders.id,
        status: order.status,
        price: order.price,
        customer: order.orders.users.username,
        quantity: order.quantity,
      },
      product: {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
      },
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  async isOrderExists(username: string, order_id: number): Promise<void> {
    const check = await this.orderSellerRepository.isOrderExists(
      username,
      order_id,
    );

    if (!check) {
      throw new HttpException('order is not found', 404);
    }
  }

  async search(
    username: string,
    req: SearchOrderSellerRequest,
  ): Promise<ResponseModel<OrderSellerResponse[]>> {
    this.logger.info(`Search order seller request: ${JSON.stringify(req)}`);
    const searchRequest: SearchOrderSellerRequest =
      this.validationService.validate(OrderSellerValidation.SEARCH, req);

    const where: any = {
      products: {
        username,
      },
      status: searchRequest.status,
    };

    const search = searchRequest.search;

    if (search) {
      where.OR = [
        {
          products: {
            name: {
              contains: search,
            },
          },
        },
        {
          orders: {
            username: {
              contains: search,
            },
          },
        },
      ];
    }

    const total_data = await this.orderSellerRepository.getTotalOrder(where);

    if (!total_data) {
      throw new HttpException('no order available', 404);
    }

    const current_page = searchRequest.page;
    const size = searchRequest.size;
    searchRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const orders = await this.orderSellerRepository.search(
      where,
      searchRequest,
    );

    const result = orders.map((order) => {
      return this.toOrderSellerResponse(order);
    });

    return {
      data: result,
      paging: {
        current_page,
        size,
        total_page,
        total_data,
      },
    };
  }

  async getOrderDetail(
    username: string,
    req: GetOrderDetailRequest,
  ): Promise<OrderSellerDetailResponse> {
    this.logger.info(`Get order detail request: ${JSON.stringify(req)}`);

    await this.wishlistService.isProductExists(req.product_id);
    await this.isOrderExists(username, req.order_id);

    const order = await this.orderSellerRepository.getOrderDetail(
      username,
      req,
    );

    const address = order.orders.addresses;

    return {
      order: {
        id: req.order_id,
        price: order.price,
        quantity: order.quantity,
        status: order.status,
        total: order.price * order.quantity,
        address,
      },
      product: {
        id: req.product_id,
        name: order.products.name,
        image_url: order.products.image_url,
        weight: order.products.weight,
      },
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  async update(
    username: string,
    req: UpdateOrderSellerRequest,
  ): Promise<OrderSellerResponse> {
    this.logger.info(`Update order seller request: ${JSON.stringify(req)}`);
    const updateRequest: UpdateOrderSellerRequest =
      this.validationService.validate(OrderSellerValidation.UPDATE, req);

    await this.wishlistService.isProductExists(updateRequest.product_id);
    await this.isOrderExists(username, updateRequest.order_id);

    const order = await this.orderSellerRepository.update(
      username,
      updateRequest,
    );

    return this.toOrderSellerResponse(order);
  }
}
