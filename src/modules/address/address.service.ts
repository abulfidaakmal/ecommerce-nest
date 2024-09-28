import { Inject, Injectable } from '@nestjs/common';
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
}
