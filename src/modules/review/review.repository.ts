import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateReviewRequest } from '../../model/review.model';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isOrderExists(username: string, product_id: number) {
    return this.prismaService.orderDetails.findFirst({
      where: { product_id, orders: { username } },
      select: { status: true },
    });
  }

  async existingReview(username: string, product_id: number): Promise<number> {
    return this.prismaService.review.count({
      where: { username, product_id },
    });
  }

  async create(username: string, req: CreateReviewRequest) {
    return this.prismaService.$transaction(async (prisma) => {
      const review = await prisma.review.create({
        data: { username, ...req },
        select: {
          id: true,
          rating: true,
          summary: true,
          image_url: true,
          product_id: true,
          products: {
            select: {
              name: true,
              image_url: true,
            },
          },
          created_at: true,
          updated_at: true,
        },
      });

      const orderDetail = await prisma.orderDetails.findFirst({
        where: { product_id: req.product_id, orders: { username } },
        select: { id: true },
      });

      await prisma.orderDetails.update({
        where: { id: orderDetail.id },
        data: { status: 'COMPLETED' },
      });

      return review;
    });
  }
}
