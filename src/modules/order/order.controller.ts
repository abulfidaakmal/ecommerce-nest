import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth } from '../../common/auth.decorator';
import {
  CreateOrderRequest,
  GetAllOrderRequest,
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
}
