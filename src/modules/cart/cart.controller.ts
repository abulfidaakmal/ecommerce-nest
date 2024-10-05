import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth } from '../../common/auth.decorator';
import { CartResponse, CreateCartRequest } from '../../model/cart.model';
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
}
