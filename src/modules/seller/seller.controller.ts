import { Body, Controller, Get, Post } from '@nestjs/common';
import { SellerService } from './seller.service';
import { Auth } from '../../common/auth.decorator';
import {
  RegisterSellerRequest,
  SellerResponse,
} from '../../model/seller.model';
import { ResponseModel } from '../../model/response.model';
import { Roles } from '../../common/roles.decorator';

@Controller('/api/sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post()
  async register(
    @Auth() username: string,
    @Body() req: RegisterSellerRequest,
  ): Promise<ResponseModel<SellerResponse>> {
    const result: SellerResponse = await this.sellerService.register(
      username,
      req,
    );

    return {
      data: result,
    };
  }

  @Get()
  @Roles('SELLER', 'ADMIN')
  async get(@Auth() username: string): Promise<ResponseModel<SellerResponse>> {
    const result: SellerResponse = await this.sellerService.get(username);

    return {
      data: result,
    };
  }
}