import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth } from '../../common/auth.decorator';
import { CreateOrderRequest, OrderResponse } from '../../model/order.model';
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
}
