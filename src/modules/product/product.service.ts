import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CategoryService } from '../category/category.service';
import { ValidationService } from '../../common/validation.service';
import { ProductRepository } from './product.repository';
import {
  CreateProductRequest,
  ProductDetailResponse,
  ProductResponse,
  SearchProductRequest,
  UpdateProductRequest,
} from '../../model/product.model';
import { ProductValidation } from './product.validation';
import { v4 as uuid } from 'uuid';
import { ResponseModel } from '../../model/response.model';

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

  async isProductExists(username: string, product_id: number): Promise<void> {
    const check = await this.productRepository.isProductExists(
      username,
      product_id,
    );

    if (!check) {
      throw new HttpException('product is not found', 404);
    }
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

  async search(
    username: string,
    req: SearchProductRequest,
  ): Promise<ResponseModel<ProductResponse[]>> {
    this.logger.info(`Search product request: ${JSON.stringify(req)}`);
    const searchRequest: SearchProductRequest = this.validationService.validate(
      ProductValidation.SEARCH,
      req,
    );

    const where: any = { username, isDeleted: searchRequest.isDeleted };

    if (searchRequest.search) {
      where.name = { contains: searchRequest.search };
    }

    const total_data = await this.productRepository.getTotalProduct(where);

    if (!total_data) {
      throw new HttpException('product is not found', 404);
    }

    const current_page = searchRequest.page;
    const size = searchRequest.size;
    searchRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const products = await this.productRepository.search(where, searchRequest);

    const result = products.map((product) => {
      console.info(product);
      return this.toProductResponse(product);
    });

    return {
      data: result,
      paging: {
        current_page,
        size,
        total_data,
        total_page,
      },
    };
  }

  async getById(
    username: string,
    product_id: number,
  ): Promise<ProductDetailResponse> {
    this.logger.info(`Get product by id request: ${product_id}`);

    await this.isProductExists(username, product_id);

    const product = await this.productRepository.getById(username, product_id);

    return {
      id: product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      weight: product.weight,
      condition: product.condition,
      image_url: product.image_url,
      sku: product.sku,
      category_name: product.categories.name,
      isDeleted: product.isDeleted,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }

  async update(
    username: string,
    product_id: number,
    req: UpdateProductRequest,
  ): Promise<ProductResponse> {
    this.logger.info(`Update product request: ${JSON.stringify(req)}`);
    const updateRequest: UpdateProductRequest = this.validationService.validate(
      ProductValidation.UPDATE,
      req,
    );

    await this.isProductExists(username, product_id);

    if (updateRequest.category_id) {
      await this.categoryService.isCategoryExists(updateRequest.category_id);
    }

    const product = await this.productRepository.update(
      product_id,
      updateRequest,
    );

    return this.toProductResponse(product);
  }

  async remove(username: string, product_id: number): Promise<string> {
    this.logger.info(`Remove product request: ${product_id}`);

    await this.isProductExists(username, product_id);

    await this.productRepository.remove(username, product_id);

    return 'OK';
  }
}
