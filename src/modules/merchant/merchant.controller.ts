import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { ResponseModel } from '../../model/response.model';
import {
  GetProductMerchantRequest,
  MerchantInfoResponse,
  ProductMerchantResponse,
} from '../../model/merchant.model';

@Controller('/api/merchants/:merchantName')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  async getMerchantInfo(
    @Param('merchantName') merchantName: string,
  ): Promise<ResponseModel<MerchantInfoResponse>> {
    const result: MerchantInfoResponse =
      await this.merchantService.getInfo(merchantName);

    return {
      data: result,
    };
  }

  @Get('/products')
  async getProductMerchant(
    @Param('merchantName') merchantName: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(60), ParseIntPipe) size: number,
  ): Promise<ResponseModel<ProductMerchantResponse[]>> {
    const req: GetProductMerchantRequest = { merchantName, page, size };

    return this.merchantService.getProduct(req);
  }
}
