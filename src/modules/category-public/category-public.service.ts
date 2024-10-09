import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CategoryPublicRepository } from './category-public.repository';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  CategoryPublicResponse,
  GetAllCategoryRequest,
} from '../../model/category-public.model';
import { ResponseModel } from '../../model/response.model';
import { ValidationService } from '../../common/validation.service';
import { CategoryPublicValidation } from './category-public.validation';
import { CategoryRepository } from '../category/category.repository';

@Injectable()
export class CategoryPublicService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly categoryPublicRepository: CategoryPublicRepository,
    private readonly validationService: ValidationService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getAll(
    req: GetAllCategoryRequest,
  ): Promise<ResponseModel<CategoryPublicResponse[]>> {
    this.logger.info(`Get all category public request: ${JSON.stringify(req)}`);
    const getAllRequest: GetAllCategoryRequest =
      this.validationService.validate(CategoryPublicValidation.GET, req);

    const total_data = await this.categoryRepository.getTotalCategory();

    if (!total_data) {
      throw new HttpException('no category available', 404);
    }

    const current_page = getAllRequest.page;
    const size = getAllRequest.size;
    getAllRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const categories =
      await this.categoryPublicRepository.getAll(getAllRequest);

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
