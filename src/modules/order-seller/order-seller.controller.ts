import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrderSellerService } from './order-seller.service';
import { Auth } from '../../common/auth.decorator';
import { ResponseModel } from '../../model/response.model';
import {
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
}
