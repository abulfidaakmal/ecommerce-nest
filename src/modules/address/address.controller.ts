import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
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

  @Put('/:addressId')
  async update(
    @Auth() username: string,
    @Param('addressId', ParseIntPipe) address_id: number,
    @Body() req: CreateAddressRequest,
  ): Promise<ResponseModel<AddressResponse>> {
    const result: AddressResponse = await this.addressService.update(
      username,
      address_id,
      req,
    );

    return {
      data: result,
    };
  }

  @Delete('/:addressId')
  async remove(
    @Auth() username: string,
    @Param('addressId', ParseIntPipe) address_id: number,
  ): Promise<ResponseModel<string>> {
    const result: string = await this.addressService.remove(
      username,
      address_id,
    );

    return {
      data: result,
    };
  }
}
