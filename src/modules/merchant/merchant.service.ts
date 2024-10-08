import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { MerchantRepository } from './merchant.repository';
import {
  GetProductMerchantRequest,
  MerchantInfoResponse,
  ProductMerchantResponse,
} from '../../model/merchant.model';
import { ValidationService } from '../../common/validation.service';
import { MerchantValidation } from './merchant.validation';
import { ResponseModel } from '../../model/response.model';

@Injectable()
export class MerchantService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly merchantRepository: MerchantRepository,
    private readonly validationService: ValidationService,
  ) {}

  async isMerchantExists(merchantName: string): Promise<void> {
    const check = await this.merchantRepository.isMerchantExists(merchantName);

    if (!check) {
      throw new HttpException('merchant is not found', 404);
    }
  }

  async ratingInfo(merchantName: string) {
    const ratings = await this.merchantRepository.getRatingInfo(merchantName);

    const ratingTotal: number = ratings._count.rating;
    let percentage = 0;

    if (ratingTotal) percentage = (ratingTotal / ratings._sum.rating) * 100;

    const ratingPercentage: string = `${Math.round(percentage)}%`;

    return {
      ratingTotal,
      ratingPercentage,
    };
  }

  async getInfo(merchantName: string): Promise<MerchantInfoResponse> {
    this.logger.info(`Get merchant info request: ${merchantName}`);

    await this.isMerchantExists(merchantName);

    const ratingInfo = await this.ratingInfo(merchantName);

    const merchant = await this.merchantRepository.getMerchant(merchantName);

    const completedProduct =
      await this.merchantRepository.getCompletedProducts(merchantName);

    const productTotal =
      await this.merchantRepository.getTotalProducts(merchantName);

    return {
      seller: {
        name: merchantName,
        description: merchant.description,
        avatar: merchant.users.avatar,
        created_at: merchant.created_at,
      },
      address: {
        city: merchant.addresses.city,
        province: merchant.addresses.province,
      },
      rating: {
        percentage: ratingInfo.ratingPercentage,
        total: ratingInfo.ratingTotal,
      },
      product: {
        complete: completedProduct,
        total: productTotal,
      },
    };
  }

  async getProduct(
    req: GetProductMerchantRequest,
  ): Promise<ResponseModel<ProductMerchantResponse[]>> {
    this.logger.info(`Get product merchant request: ${JSON.stringify(req)}`);
    const getRequest: GetProductMerchantRequest =
      this.validationService.validate(MerchantValidation.GET, req);

    await this.isMerchantExists(getRequest.merchantName);

    const total_data = await this.merchantRepository.getTotalProducts(
      getRequest.merchantName,
    );

    if (!total_data) {
      throw new HttpException('no product available', 404);
    }

    const current_page = getRequest.page;
    const size = getRequest.size;
    getRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const products = await this.merchantRepository.getProducts(getRequest);

    const result = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        price: product.price,
      };
    });

    return {
      data: result,
      paging: {
        current_page,
        size,
        total_page,
        total_data,
      },
    };
  }
}
