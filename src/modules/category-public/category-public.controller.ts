import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CategoryPublicService } from './category-public.service';
import { ResponseModel } from '../../model/response.model';
import {
  CategoryPublicResponse,
  GetAllCategoryRequest,
} from '../../model/category-public.model';

@Controller('api/public/categories')
export class CategoryPublicController {
  constructor(private readonly categoryPublicService: CategoryPublicService) {}

  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(25), ParseIntPipe) size: number,
  ): Promise<ResponseModel<CategoryPublicResponse[]>> {
    const req: GetAllCategoryRequest = { page, size };

    return this.categoryPublicService.getAll(req);
  }
}
