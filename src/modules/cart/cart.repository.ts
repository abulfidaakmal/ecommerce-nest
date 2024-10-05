import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateCartRequest,
  GetAllCartRequest,
  UpdateCartRequest,
} from '../../model/cart.model';

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

  async getTotalCart(username: string): Promise<number> {
    return this.prismaService.cart.count({
      where: { username },
    });
  }

  async getAll(username: string, req: GetAllCartRequest) {
    return this.prismaService.cart.findMany({
      where: { username },
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
            price: true,
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
      take: req.size,
      skip: req.page,
    });
  }

  async isCartExists(username: string, cart_id: number): Promise<number> {
    return this.prismaService.cart.count({
      where: { username, id: cart_id },
    });
  }

  async getProductId(username: string, cart_id: number): Promise<number> {
    const product = await this.prismaService.cart.findFirst({
      where: { username, id: cart_id },
      select: { product_id: true },
    });

    return product.product_id;
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

  async remove(username: string, cart_id: number): Promise<void> {
    await this.prismaService.cart.delete({
      where: { username, id: cart_id },
    });
  }
}
