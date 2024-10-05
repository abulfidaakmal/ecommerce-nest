import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth } from '../../common/auth.decorator';
import {
  CartResponse,
  CreateCartRequest,
  GetAllCartRequest,
} from '../../model/cart.model';
import { ResponseModel } from '../../model/response.model';

@Controller('/api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async create(
    @Auth() username: string,
    @Body() req: CreateCartRequest,
  ): Promise<ResponseModel<CartResponse>> {
    const result: CartResponse = await this.cartService.create(username, req);

    return {
      data: result,
    };
  }

  @Get()
  async get(
    @Auth() username: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ): Promise<ResponseModel<CartResponse[]>> {
    const req: GetAllCartRequest = { page, size };

    return this.cartService.getAll(username, req);
  }
}
