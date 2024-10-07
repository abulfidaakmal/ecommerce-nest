import { Logger } from 'winston';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { OrderRepository } from './order.repository';
import { ValidationService } from '../../common/validation.service';
import {
  CreateOrderRequest,
  GetAllOrderRequest,
  GetOrderDetailRequest,
  OrderDetailResponse,
  OrderResponse,
} from '../../model/order.model';
import { OrderValidation } from './order.validation';
import { ResponseModel } from '../../model/response.model';
import { Status } from '@prisma/client';
import { WishlistService } from '../wishlist/wishlist.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly orderRepository: OrderRepository,
    private readonly validationService: ValidationService,
    private readonly wishlistService: WishlistService,
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

  async isOrderExists(username: string, order_id: number): Promise<void> {
    const check = await this.orderRepository.isOrderExists(username, order_id);

    if (!check) {
      throw new HttpException('order is not found', 404);
    }
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

  async getAll(
    username: string,
    req: GetAllOrderRequest,
  ): Promise<ResponseModel<OrderResponse[]>> {
    this.logger.info(`Get all order request: ${JSON.stringify(req)}`);
    const getAllRequest: GetAllOrderRequest = this.validationService.validate(
      OrderValidation.GET,
      req,
    );

    let status: any = {
      in: [Status.PENDING, Status.CONFIRMED, Status.SHIPPED, Status.PROCESSING],
    };

    if (getAllRequest.status === 'COMPLETED') {
      status = { in: [Status.COMPLETED, Status.DELIVERED] };
    } else if (getAllRequest.status === 'CANCELLED') {
      status = { in: [Status.CANCELLED, Status.CANCELLEDBYSELLER] };
    }

    const total_data = await this.orderRepository.getTotalOrder(
      username,
      status,
    );

    if (!total_data) {
      throw new HttpException('no order available', 404);
    }

    const current_page = getAllRequest.page;
    const size = getAllRequest.size;
    getAllRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const orders = await this.orderRepository.getAll(
      username,
      status,
      getAllRequest,
    );

    const result = await Promise.all(
      orders.map(async (order) => {
        const products = order.order_details.map((detail) => detail.products);

        return this.toOrderResponse(order, products);
      }),
    );

    return {
      data: result,
      paging: {
        total_page,
        size,
        total_data,
        current_page,
      },
    };
  }

  async getOrderDetail(
    username: string,
    req: GetOrderDetailRequest,
  ): Promise<OrderDetailResponse> {
    this.logger.info(`Get order detail request: ${JSON.stringify(req)}`);

    await this.isOrderExists(username, req.order_id);
    await this.wishlistService.isProductExists(req.product_id);

    const order = await this.orderRepository.getOrderDetail(username, req);

    const address = order.addresses;
    const orderDetails = order.order_details[0];
    const product = orderDetails.products;
    const seller = product.users.sellers;

    return {
      order: {
        id: req.order_id,
        status: orderDetails.status,
        address: {
          id: address.id,
          street: address.street,
          city: address.city,
          province: address.province,
          postal_code: address.postal_code,
          name: address.name,
          phone: address.phone,
        },
        price: orderDetails.price,
        quantity: orderDetails.quantity,
        total: orderDetails.price * orderDetails.quantity,
      },
      product: {
        id: req.product_id,
        name: product.name,
        image_url: product.image_url,
        weight: product.weight,
        seller: {
          name: seller.name,
          city: seller.addresses.city,
          province: seller.addresses.province,
        },
      },
      created_at: orderDetails.created_at,
      updated_at: orderDetails.updated_at,
    };
  }

  async cancelProduct(
    username: string,
    req: GetOrderDetailRequest,
  ): Promise<string> {
    this.logger.info(`Cancel product order request: ${JSON.stringify(req)}`);

    await this.isOrderExists(username, req.order_id);
    await this.wishlistService.isProductExists(req.product_id);

    const orderStatus = await this.orderRepository.getOrderStatus(req);

    const validStatus = ['PENDING', 'CONFIRMED'];
    if (!validStatus.includes(orderStatus.status)) {
      throw new HttpException('product cannot be cancelled', 400);
    }

    await this.orderRepository.cancelProduct(req);

    return 'OK';
  }
}
