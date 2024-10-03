import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CategoryService } from '../category/category.service';
import { ValidationService } from '../../common/validation.service';
import { ProductRepository } from './product.repository';
import {
  CreateProductRequest,
  ProductResponse,
} from '../../model/product.model';
import { ProductValidation } from './product.validation';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly categoryService: CategoryService,
    private readonly validationService: ValidationService,
    private readonly productRepository: ProductRepository,
  ) {}

  private toProductResponse(product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      category_name: product.categories.name,
      isDeleted: product.isDeleted,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }

  async create(
    username: string,
    req: CreateProductRequest,
  ): Promise<ProductResponse> {
    this.logger.info(`Create product request: ${JSON.stringify(req)}`);
    const createRequest: CreateProductRequest = this.validationService.validate(
      ProductValidation.CREATE,
      req,
    );

    await this.categoryService.isCategoryExists(createRequest.category_id);

    createRequest.sku = 'SK-' + uuid().split('-')[0];

    const product = await this.productRepository.create(
      username,
      createRequest,
    );

    return this.toProductResponse(product);
  }
}
