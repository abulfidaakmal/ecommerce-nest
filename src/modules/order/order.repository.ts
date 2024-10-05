import { PrismaService } from '../../common/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isProductsExists(product_ids: number[]): Promise<number> {
    return this.prismaService.product.count({
      where: {
        id: {
          in: product_ids,
        },
        isDeleted: false,
      },
    });
  }

  async isAddressExists(username: string): Promise<{ id: number }> {
    return this.prismaService.address.findFirst({
      where: { username },
      select: { id: true },
    });
  }

  async getProduct(product_ids: number[]) {
    return this.prismaService.product.findMany({
      where: { id: { in: product_ids } },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        image_url: true,
        users: {
          select: {
            sellers: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async create(username: string, data, address_id: number) {
    return this.prismaService.$transaction(async (prisma) => {
      return prisma.order.create({
        data: {
          username,
          address_id,
          order_details: {
            createMany: {
              data,
            },
          },
        },
        select: {
          id: true,
          order_details: {
            select: {
              quantity: true,
              status: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      });
    });
  }
}
