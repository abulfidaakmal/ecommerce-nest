import { Body, Controller, Post } from '@nestjs/common';
import { AddressService } from './address.service';
import { Auth } from '../../common/auth.decorator';
import {
  AddressResponse,
  CreateAddressRequest,
} from '../../model/address.model';
import { ResponseModel } from '../../model/response.model';

@Controller('/api/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async create(
    @Auth() username: string,
    @Body() req: CreateAddressRequest,
  ): Promise<ResponseModel<AddressResponse>> {
    const result: AddressResponse = await this.addressService.create(
      username,
      req,
    );

    return {
      data: result,
    };
  }
}
