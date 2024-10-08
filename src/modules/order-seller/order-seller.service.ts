import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { OrderSellerRepository } from './order-seller.repository';
import {
  OrderSellerResponse,
  SearchOrderSellerRequest,
} from '../../model/order-seller.model';
import { ResponseModel } from '../../model/response.model';
import { ValidationService } from '../../common/validation.service';
import { OrderSellerValidation } from './order-seller.validation';

@Injectable()
export class OrderSellerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly orderSellerRepository: OrderSellerRepository,
    private readonly validationService: ValidationService,
  ) {}

  private toOrderSellerResponse(order): OrderSellerResponse {
    const product = order.products;

    return {
      order: {
        id: order.id,
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
}
