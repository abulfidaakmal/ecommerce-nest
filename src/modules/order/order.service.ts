import { Logger } from 'winston';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { OrderRepository } from './order.repository';
import { ValidationService } from '../../common/validation.service';
import { CreateOrderRequest, OrderResponse } from '../../model/order.model';
import { OrderValidation } from './order.validation';

@Injectable()
export class OrderService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly orderRepository: OrderRepository,
    private readonly validationService: ValidationService,
  ) {}

  toOrderResponse(order, products: any): OrderResponse {
    const orderDetails = order.order_details;

    const totalQuantity = orderDetails.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );

    const totalPrice = orderDetails.reduce(
      (acc, curr, index) => acc + products[index].price * curr.quantity,
      0,
    );

    return {
      order: {
        id: order.id,
        total_price: totalPrice,
        total_quantity: totalQuantity,
      },
      product: products.map((product, index) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: orderDetails[index].quantity,
        status: orderDetails[index].status,
        seller_name: product.users.sellers.name,
      })),
      created_at: orderDetails[0].created_at,
      updated_at: orderDetails[0].updated_at,
    };
  }

  async create(
    username: string,
    req: CreateOrderRequest[],
  ): Promise<OrderResponse> {
    this.logger.info(`Create order request: ${JSON.stringify(req)}`);
    const createRequest: CreateOrderRequest[] = this.validationService.validate(
      OrderValidation.CREATE,
      req,
    );

    const isAddressExists =
      await this.orderRepository.isAddressExists(username);

    if (!isAddressExists) {
      throw new HttpException(
        'please add your address before placing an order',
        400,
      );
    }

    const product_ids = createRequest.map((req) => req.product_id);

    const isProductsExists =
      await this.orderRepository.isProductsExists(product_ids);

    if (!isProductsExists) {
      throw new HttpException('one or more products were not found', 404);
    }

    const products = await this.orderRepository.getProduct(product_ids);

    createRequest.forEach((req) => {
      const product = products.find((product) => product.id === req.product_id);
      if (product.stock < req.quantity) {
        throw new HttpException(
          `product ${product.name} has insufficient stock`,
          400,
        );
      }
    });

    const data = createRequest.map((req) => {
      const product = products.find((product) => product.id === req.product_id);

      return {
        product_id: req.product_id,
        quantity: req.quantity,
        price: product.price,
      };
    });

    const orders = await this.orderRepository.create(
      username,
      data,
      isAddressExists.id,
      product_ids,
    );

    return this.toOrderResponse(orders, products);
  }
}
