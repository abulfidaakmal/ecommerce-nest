import { Body, Controller, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ResponseModel } from '../../model/response.model';
import {
  CategoryResponse,
  CreateCategoryRequest,
} from '../../model/category.model';
import { Auth } from '../../common/auth.decorator';
import { Roles } from '../../common/roles.decorator';

@Controller('/api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles('ADMIN')
  async create(
    @Auth() username: string,
    @Body() req: CreateCategoryRequest,
  ): Promise<ResponseModel<CategoryResponse>> {
    const result: CategoryResponse = await this.categoryService.create(
      username,
      req,
    );

    return {
      data: result,
    };
  }
}
