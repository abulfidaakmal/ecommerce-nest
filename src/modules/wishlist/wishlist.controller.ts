import { Body, Controller, Post } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Auth } from '../../common/auth.decorator';
import {
  CreateWishlistRequest,
  WishlistResponse,
} from '../../model/wishlist.model';
import { ResponseModel } from '../../model/response.model';

@Controller('/api/users/wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async create(
    @Auth() username: string,
    @Body() req: CreateWishlistRequest,
  ): Promise<ResponseModel<WishlistResponse>> {
    const result: WishlistResponse = await this.wishlistService.create(
      username,
      req,
    );

    return {
      data: result,
    };
  }
}
