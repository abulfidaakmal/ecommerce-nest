import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateReviewRequest,
  GetAllReviewRequest,
  UpdateReviewRequest,
} from '../../model/review.model';

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

  async getTotalReview(username: string): Promise<number> {
    return this.prismaService.review.count({
      where: { username },
    });
  }

  async getAll(username: string, req: GetAllReviewRequest) {
    return this.prismaService.review.findMany({
      where: { username },
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
      take: req.size,
      skip: req.page,
    });
  }

  async isReviewExists(username: string, review_id: number): Promise<number> {
    return this.prismaService.review.count({
      where: { username, id: review_id },
    });
  }

  async update(username: string, review_id: number, req: UpdateReviewRequest) {
    return this.prismaService.review.update({
      where: { username, id: review_id },
      data: req,
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
  }

  async remove(username: string, review_id: number): Promise<void> {
    await this.prismaService.review.delete({
      where: { username, id: review_id },
    });
  }
}
