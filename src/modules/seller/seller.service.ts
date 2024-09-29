import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { SellerRepository } from './seller.repository';
import { ValidationService } from '../../common/validation.service';
import {
  RegisterSellerRequest,
  SellerResponse,
} from '../../model/seller.model';
import { SellerValidation } from './seller.validation';
import { AddressService } from '../address/address.service';

@Injectable()
export class SellerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private readonly sellerRepository: SellerRepository,
    private readonly addressService: AddressService,
  ) {}

  async isNameAlreadyExists(name: string): Promise<void> {
    const check = await this.sellerRepository.isNameAlreadyExists(name);

    if (check) {
      throw new HttpException('name already exists', 400);
    }
  }

  async register(
    username: string,
    req: RegisterSellerRequest,
  ): Promise<SellerResponse> {
    this.logger.info(`Register seller request: ${JSON.stringify(req)}`);
    const registerRequest: RegisterSellerRequest =
      this.validationService.validate(SellerValidation.REGISTER, req);

    const hasBeenSeller = await this.sellerRepository.hasBeenSeller(username);

    if (hasBeenSeller) {
      throw new HttpException('user is already a registered seller', 409);
    }

    await this.isNameAlreadyExists(registerRequest.name);

    await this.addressService.isAddressExist(
      username,
      registerRequest.address_id,
    );

    return this.sellerRepository.register(username, registerRequest);
  }
}
