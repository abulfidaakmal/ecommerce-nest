import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth } from '../../common/auth.decorator';
import {
  CreateOrderRequest,
  GetAllOrderRequest,
  GetOrderDetailRequest,
  OrderDetailResponse,
  OrderResponse,
} from '../../model/order.model';
import { ResponseModel } from '../../model/response.model';

@Controller('/api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Auth() username: string,
    @Body() req: CreateOrderRequest[],
  ): Promise<ResponseModel<OrderResponse>> {
    const result: OrderResponse = await this.orderService.create(username, req);

    return {
      data: result,
    };
  }

  @Get()
  async getAll(
    @Auth() username: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    @Query('status', new DefaultValuePipe('ONGOING')) status: string,
  ): Promise<ResponseModel<OrderResponse[]>> {
    const req: GetAllOrderRequest = { page, size, status };

    return this.orderService.getAll(username, req);
  }

  @Get('/:orderId/products/:productId')
  async getOrderDetail(
    @Auth() username: string,
    @Param('orderId', ParseIntPipe) order_id: number,
    @Param('productId', ParseIntPipe) product_id: number,
  ): Promise<ResponseModel<OrderDetailResponse>> {
    const req: GetOrderDetailRequest = { order_id, product_id };

    const result: OrderDetailResponse = await this.orderService.getOrderDetail(
      username,
      req,
    );

    return {
      data: result,
    };
  }

  @Patch('/:orderId/products/:productId')
  async cancelProduct(
    @Auth() username: string,
    @Param('orderId', ParseIntPipe) order_id: number,
    @Param('productId', ParseIntPipe) product_id: number,
  ): Promise<ResponseModel<string>> {
    const req: GetOrderDetailRequest = { order_id, product_id };

    const result: string = await this.orderService.cancelProduct(username, req);

    return {
      data: result,
    };
  }
}
