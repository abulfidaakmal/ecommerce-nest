import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { GetProductMerchantRequest } from '../../model/merchant.model';

@Injectable()
export class MerchantRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isMerchantExists(merchantName: string): Promise<number> {
    return this.prismaService.seller.count({
      where: { name: merchantName },
    });
  }

  async getRatingInfo(merchantName: string) {
    return this.prismaService.review.aggregate({
      where: {
        products: {
          users: {
            sellers: { name: merchantName },
          },
        },
      },
      _sum: { rating: true },
      _count: { rating: true },
    });
  }

  async getCompletedProducts(merchantName: string): Promise<number> {
    return this.prismaService.orderDetails.count({
      where: {
        products: {
          users: {
            sellers: { name: merchantName },
          },
        },
      },
    });
  }

  async getTotalProducts(merchantName: string): Promise<number> {
    return this.prismaService.product.count({
      where: {
        users: {
          sellers: { name: merchantName },
        },
      },
    });
  }

  async getMerchant(merchantName: string) {
    return this.prismaService.seller.findFirst({
      where: { name: merchantName },
      select: {
        description: true,
        created_at: true,
        users: {
          select: {
            avatar: true,
          },
        },
        addresses: {
          select: {
            city: true,
            province: true,
          },
        },
      },
    });
  }

  async getProducts(req: GetProductMerchantRequest) {
    return this.prismaService.product.findMany({
      where: {
        users: {
          sellers: {
            name: req.merchantName,
          },
        },
      },
      select: {
        id: true,
        name: true,
        image_url: true,
        price: true,
      },
      take: req.size,
      skip: req.page,
    });
  }
}
