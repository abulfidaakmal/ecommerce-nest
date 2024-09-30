import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ResponseModel } from '../../model/response.model';
import {
  CategoryResponse,
  CreateCategoryRequest,
  GetAllCategoryRequest,
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

  @Get()
  @Roles('ADMIN')
  async getAll(
    @Auth() username: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(25), ParseIntPipe) size: number,
  ): Promise<ResponseModel<CategoryResponse[]>> {
    const req: GetAllCategoryRequest = { page, size };

    return this.categoryService.getAll(req);
  }

  @Patch('/:categoryId')
  @Roles('ADMIN')
  async update(
    @Auth() username: string,
    @Param('categoryId', ParseIntPipe) category_id: number,
    @Body() req: CreateCategoryRequest,
  ): Promise<ResponseModel<CategoryResponse>> {
    const result: CategoryResponse = await this.categoryService.update(
      category_id,
      req,
    );

    return {
      data: result,
    };
  }
}
