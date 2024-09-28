import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from '../../common/validation.service';
import { AddressRepository } from './address.repository';
import {
  AddressResponse,
  CreateAddressRequest,
} from '../../model/address.model';
import { AddressValidation } from './address.validation';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly addressRepository: AddressRepository,
    private readonly validationService: ValidationService,
  ) {}

  async isAddressExist(username: string, address_id: number): Promise<void> {
    const isAddressExist = await this.addressRepository.isAddressExist(
      username,
      address_id,
    );

    if (!isAddressExist) {
      throw new HttpException('address is not found', 404);
    }
  }

  async create(
    username: string,
    req: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.info(`Create address request: ${JSON.stringify(req)}`);
    const createRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      req,
    );

    const isSelectedAddressAlreadyExists =
      await this.addressRepository.isSelectedAddressAlreadyExists(username);

    if (!isSelectedAddressAlreadyExists) {
      createRequest.is_selected = true;
    }

    return this.addressRepository.create(username, createRequest);
  }

  async update(
    username: string,
    address_id: number,
    req: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.info(`Update address request: ${JSON.stringify(req)}`);
    const updateRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      req,
    );

    await this.isAddressExist(username, address_id);

    return this.addressRepository.update(address_id, updateRequest);
  }
}
