import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { GetAllWishlistRequest } from '../../model/wishlist.model';

@Injectable()
export class WishlistRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isProductExists(product_id: number): Promise<number> {
    return this.prismaService.product.count({
      where: { id: product_id, isDeleted: false },
    });
  }

  async existingWishlist(
    username: string,
    product_id: number,
  ): Promise<number> {
    return this.prismaService.wishlist.count({
      where: { username, product_id: product_id },
    });
  }

  async create(username: string, product_id: number) {
    return this.prismaService.wishlist.create({
      data: { username, product_id },
      select: {
        id: true,
        products: {
          select: {
            id: true,
            name: true,
            image_url: true,
            price: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
  }

  async getTotalWishlist(username: string): Promise<number> {
    return this.prismaService.wishlist.count({
      where: {
        username,
        products: {
          isDeleted: false,
        },
      },
    });
  }

  async getAll(username: string, req: GetAllWishlistRequest) {
    return this.prismaService.wishlist.findMany({
      where: {
        username,
        products: {
          isDeleted: false,
        },
      },
      select: {
        id: true,
        products: {
          select: {
            id: true,
            name: true,
            image_url: true,
            price: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
      skip: req.page,
      take: req.size,
    });
  }

  async isWishlistExists(
    username: string,
    wishlist_id: number,
  ): Promise<number> {
    return this.prismaService.wishlist.count({
      where: { username, id: wishlist_id },
    });
  }

  async remove(username: string, wishlist_id: number): Promise<void> {
    await this.prismaService.wishlist.delete({
      where: { username, id: wishlist_id },
    });
  }

  async check(username: string, product_id: number): Promise<{ id: number }> {
    return this.prismaService.wishlist.findFirst({
      where: { username, product_id },
      select: { id: true },
    });
  }
}
