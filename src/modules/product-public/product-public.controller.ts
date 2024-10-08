import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductPublicService } from './product-public.service';
import { ResponseModel } from '../../model/response.model';
import {
  GetProductByCategoryRequest,
  ProductByIdResponse,
  ProductPublicResponse,
  SearchProductRequest,
} from '../../model/product-public.model';

@Controller('/api/public/products')
export class ProductPublicController {
  constructor(private readonly productPublicService: ProductPublicService) {}

  @Get()
  async searchProduct(
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(60), ParseIntPipe) size: number,
  ): Promise<ResponseModel<ProductPublicResponse[]>> {
    const req: SearchProductRequest = { search, size, page };

    return this.productPublicService.search(req);
  }

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

  @Get('categories/:name')
  async getByCategoryName(
    @Param('name') category_name: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(60), ParseIntPipe) size: number,
  ): Promise<ResponseModel<ProductPublicResponse[]>> {
    const req: GetProductByCategoryRequest = { category_name, size, page };

    return this.productPublicService.getByCategoryName(req);
  }
}
