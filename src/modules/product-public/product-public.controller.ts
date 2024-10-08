import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductPublicService } from './product-public.service';
import { ResponseModel } from '../../model/response.model';
import { ProductByIdResponse } from '../../model/product-public.model';

@Controller('/api/public/products')
export class ProductPublicController {
  constructor(private readonly productPublicService: ProductPublicService) {}

  @Get('/:productId')
  async getById(
    @Param('productId', ParseIntPipe) product_id: number,
  ): Promise<ResponseModel<ProductByIdResponse>> {
    const result: ProductByIdResponse =
      await this.productPublicService.getById(product_id);

    return {
      data: result,
    };
  }
}
