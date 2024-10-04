import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Auth } from '../../common/auth.decorator';
import {
  CreateWishlistRequest,
  GetAllWishlistRequest,
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

  @Get()
  async getAll(
    @Auth() username: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ): Promise<ResponseModel<WishlistResponse[]>> {
    const req: GetAllWishlistRequest = { page, size };

    return this.wishlistService.getAll(username, req);
  }

  @Delete('/:wishlistId')
  async remove(
    @Auth() username: string,
    @Param('wishlistId', ParseIntPipe) wishlist_id: number,
  ): Promise<ResponseModel<string>> {
    const result: string = await this.wishlistService.remove(
      username,
      wishlist_id,
    );

    return {
      data: result,
    };
  }
}
