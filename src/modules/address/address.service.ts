import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from '../../common/validation.service';
import { AddressRepository } from './address.repository';
import {
  AddressResponse,
  CreateAddressRequest,
  SearchAddressRequest,
} from '../../model/address.model';
import { AddressValidation } from './address.validation';
import { ResponseModel } from '../../model/response.model';

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

  async search(
    username: string,
    req: SearchAddressRequest,
  ): Promise<ResponseModel<AddressResponse[]>> {
    this.logger.info(`Search address request: ${JSON.stringify(req)}`);
    const searchRequest: SearchAddressRequest = this.validationService.validate(
      AddressValidation.SEARCH,
      req,
    );

    const where: { username: string; OR?: any } = {
      username,
    };

    const search = searchRequest.search;

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          phone: {
            contains: search,
          },
        },
        {
          street: {
            contains: search,
          },
        },
      ];
    }

    const total_data = await this.addressRepository.getTotalAddress(where);

    if (!total_data) {
      throw new HttpException('address is not found', 404);
    }

    const current_page = searchRequest.page;
    const size = searchRequest.size;
    searchRequest.page = (current_page - 1) * size;
    const total_page = Math.ceil(total_data / size);

    const addresses: AddressResponse[] = await this.addressRepository.search(
      where,
      searchRequest,
    );

    return {
      data: addresses,
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
    address_id: number,
  ): Promise<AddressResponse> {
    this.logger.info(`Get address by id request: ${address_id}`);

    await this.isAddressExist(username, address_id);

    return this.addressRepository.getById(username, address_id);
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

  async remove(username: string, address_id: number): Promise<string> {
    this.logger.info(`Remove address request: ${address_id}`);

    await this.isAddressExist(username, address_id);

    const address: { is_selected: boolean } =
      await this.addressRepository.remove(address_id);

    if (address.is_selected) {
      const anotherAddress: { id: number } =
        await this.addressRepository.anotherAddress(username);

      await this.addressRepository.selectAddress(username, anotherAddress.id);
    }

    return 'OK';
  }

  async select(username: string, address_id: number): Promise<string> {
    this.logger.info(`Select address request: ${address_id}`);

    await this.isAddressExist(username, address_id);

    await this.addressRepository.selectAddress(username, address_id);

    return 'OK';
  }
}
