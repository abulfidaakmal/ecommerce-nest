import { Body, Controller, Post } from '@nestjs/common';
import { SellerService } from './seller.service';
import { Auth } from '../../common/auth.decorator';
import {
  RegisterSellerRequest,
  SellerResponse,
} from '../../model/seller.model';
import { ResponseModel } from '../../model/response.model';

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
}
