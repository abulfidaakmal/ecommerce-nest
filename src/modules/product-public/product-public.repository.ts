import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ProductPublicRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getById(product_id: number) {
    return this.prismaService.product.findFirst({
      where: { id: product_id, isDeleted: false },
      select: {
        name: true,
        description: true,
        image_url: true,
        price: true,
        stock: true,
        sku: true,
        weight: true,
        condition: true,
        categories: {
          select: { name: true },
        },
        users: {
          select: {
            sellers: {
              select: {
                name: true,
                users: {
                  select: { avatar: true },
                },
                addresses: {
                  select: {
                    city: true,
                    province: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getRating(product_id: number) {
    return this.prismaService.review.count({
      where: { product_id },
    });
  }

  async getSold(product_id: number) {
    return this.prismaService.orderDetails.count({
      where: { product_id },
    });
  }
}
