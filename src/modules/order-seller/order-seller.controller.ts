import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrderSellerService } from './order-seller.service';
import { Auth } from '../../common/auth.decorator';
import { ResponseModel } from '../../model/response.model';
import {
  GetOrderDetailRequest,
  OrderSellerDetailResponse,
  OrderSellerResponse,
  SearchOrderSellerRequest,
} from '../../model/order-seller.model';
import { Status } from '@prisma/client';
import { Roles } from '../../common/roles.decorator';

@Controller('/api/seller/orders')
export class OrderSellerController {
  constructor(private readonly orderSellerService: OrderSellerService) {}

  @Get()
  @Roles('SELLER', 'ADMIN')
  async search(
    @Auth() username: string,
    @Query('search') search: string,
    @Query('status', new DefaultValuePipe('PENDING')) status: Status,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ): Promise<ResponseModel<OrderSellerResponse[]>> {
    const req: SearchOrderSellerRequest = { search, page, size, status };

    return this.orderSellerService.search(username, req);
  }

  @Get('/:orderId/products/:productId')
  @Roles('SELLER', 'ADMIN')
  async getOrderDetail(
    @Auth() username: string,
    @Param('orderId', ParseIntPipe) order_id: number,
    @Param('productId', ParseIntPipe) product_id: number,
  ): Promise<ResponseModel<OrderSellerDetailResponse>> {
    const req: GetOrderDetailRequest = { order_id, product_id };

    const result: OrderSellerDetailResponse =
      await this.orderSellerService.getOrderDetail(username, req);

    return {
      data: result,
    };
  }
}
