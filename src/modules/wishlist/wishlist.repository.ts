import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

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
}
