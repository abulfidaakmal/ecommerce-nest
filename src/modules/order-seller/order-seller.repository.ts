import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  GetOrderDetailRequest,
  SearchOrderSellerRequest,
  UpdateOrderSellerRequest,
} from '../../model/order-seller.model';

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

  async isOrderExists(username: string, order_id: number): Promise<number> {
    return this.prismaService.orderDetails.count({
      where: { products: { username }, order_id: order_id },
    });
  }

  async getOrderDetail(username: string, req: GetOrderDetailRequest) {
    return this.prismaService.orderDetails.findFirst({
      where: {
        products: { username },
        order_id: req.order_id,
        product_id: req.product_id,
      },
      select: {
        price: true,
        quantity: true,
        status: true,
        created_at: true,
        updated_at: true,
        orders: {
          select: {
            addresses: true,
          },
        },
        products: {
          select: {
            name: true,
            image_url: true,
            weight: true,
          },
        },
      },
    });
  }

  async update(username: string, req: UpdateOrderSellerRequest) {
    return this.prismaService.$transaction(async (prisma) => {
      const order = await prisma.orderDetails.findFirst({
        where: {
          products: { username },
          order_id: req.order_id,
          product_id: req.product_id,
        },
        select: { id: true },
      });

      return prisma.orderDetails.update({
        where: { id: order.id },
        data: {
          status: req.status,
        },
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
      });
    });
  }
}
