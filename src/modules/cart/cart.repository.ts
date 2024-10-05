import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCartRequest, UpdateCartRequest } from '../../model/cart.model';

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async existingCart(username: string, product_id: number) {
    return this.prismaService.cart.findFirst({
      where: { username, product_id },
      select: { id: true, quantity: true },
    });
  }

  async getProductPrice(product_id: number) {
    return this.prismaService.product.findFirst({
      where: { id: product_id, isDeleted: false },
      select: { price: true },
    });
  }

  async create(username: string, req: CreateCartRequest, price: number) {
    return this.prismaService.cart.create({
      data: {
        username,
        ...req,
        total: price * req.quantity,
      },
      select: {
        id: true,
        quantity: true,
        total: true,
        created_at: true,
        updated_at: true,
        products: {
          select: {
            id: true,
            name: true,
            stock: true,
            image_url: true,
            users: {
              select: {
                sellers: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(username: string, req: UpdateCartRequest, price: number) {
    return this.prismaService.cart.update({
      where: { username, id: req.cart_id },
      data: {
        quantity: req.quantity,
        total: price * req.quantity,
      },
      select: {
        id: true,
        quantity: true,
        total: true,
        created_at: true,
        updated_at: true,
        products: {
          select: {
            id: true,
            name: true,
            stock: true,
            image_url: true,
            users: {
              select: {
                sellers: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
