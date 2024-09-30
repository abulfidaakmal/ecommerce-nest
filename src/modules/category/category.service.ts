import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from '../../common/validation.service';
import { CategoryRepository } from './category.repository';
import {
  CategoryResponse,
  CreateCategoryRequest,
} from '../../model/category.model';
import { CategoryValidation } from './category.validation';

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
}
