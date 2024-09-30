import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from '../../common/validation.service';
import { CategoryRepository } from './category.repository';
import {
  CategoryResponse,
  CreateCategoryRequest,
  GetAllCategoryRequest,
} from '../../model/category.model';
import { CategoryValidation } from './category.validation';
import { ResponseModel } from '../../model/response.model';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async isNameAlreadyExists(name: string): Promise<void> {
    const check = await this.categoryRepository.isNameAlreadyExists(name);

    if (check) {
      throw new HttpException('name already exists', 400);
    }
  }

  async create(
    username: string,
    req: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    this.logger.info(`Create category request: ${JSON.stringify(req)}`);
    const createRequest: CreateCategoryRequest =
      this.validationService.validate(CategoryValidation.CREATE, req);

    await this.isNameAlreadyExists(createRequest.name);

    return this.categoryRepository.create(username, createRequest);
  }

  async getAll(
    req: GetAllCategoryRequest,
  ): Promise<ResponseModel<CategoryResponse[]>> {
    this.logger.info(`Get all category request: ${JSON.stringify(req)}`);
    const getAllRequest: GetAllCategoryRequest =
      this.validationService.validate(CategoryValidation.GET, req);

    const total_data = await this.categoryRepository.getTotalCategory();

    if (!total_data) {
      throw new HttpException('no category available', 404);
    }

    const current_page = getAllRequest.page;
    const size = getAllRequest.size;
    getAllRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const categories: CategoryResponse[] =
      await this.categoryRepository.getAll(getAllRequest);

    return {
      data: categories,
      paging: {
        current_page,
        size,
        total_data,
        total_page,
      },
    };
  }
}
