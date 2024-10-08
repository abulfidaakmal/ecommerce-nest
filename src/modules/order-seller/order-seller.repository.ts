import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SearchOrderSellerRequest } from '../../model/order-seller.model';

@Injectable()
export class OrderSellerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getTotalOrder(where): Promise<number> {
    return this.prismaService.orderDetails.count({
      where,
    });
  }

  async search(where, req: SearchOrderSellerRequest) {
    return this.prismaService.orderDetails.findMany({
      where,
      select: {
        id: true,
        price: true,
        quantity: true,
        status: true,
        orders: {
          select: {
            users: {
              select: {
                username: true,
              },
            },
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            image_url: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
      take: req.size,
      skip: req.page,
    });
  }
}
