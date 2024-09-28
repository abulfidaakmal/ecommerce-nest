import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { Auth } from '../../common/auth.decorator';
import {
  AddressResponse,
  CreateAddressRequest,
  SearchAddressRequest,
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

  @Get()
  async search(
    @Auth() username: string,
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ): Promise<ResponseModel<AddressResponse[]>> {
    const req: SearchAddressRequest = { search, page, size };

    return this.addressService.search(username, req);
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

  @Patch('/:addressId')
  async select(
    @Auth() username: string,
    @Param('addressId', ParseIntPipe) address_id: number,
  ): Promise<ResponseModel<string>> {
    const result: string = await this.addressService.select(
      username,
      address_id,
    );

    return {
      data: result,
    };
  }
}
