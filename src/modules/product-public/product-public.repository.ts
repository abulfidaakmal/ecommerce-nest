import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  GetProductByCategoryRequest,
  ProductPublicResponse,
  ProductReviewRequest,
  SearchProductRequest,
} from '../../model/product-public.model';

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

  async getAll(req: ProductReviewRequest) {
    return this.prismaService.review.findMany({
      where: { product_id: req.product_id },
      select: {
        id: true,
        rating: true,
        summary: true,
        image_url: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getRatingInfo(product_id: number) {
    return this.prismaService.review.aggregate({
      where: { product_id },
      _sum: {
        rating: true,
      },
      _avg: {
        rating: true,
      },
    });
  }

  async getTotalRatingByRating(
    product_id: number,
    rating: number,
  ): Promise<number> {
    return this.prismaService.review.count({
      where: { rating, product_id },
    });
  }

  async getReview(product_id: number) {
    return this.prismaService.review.count({
      where: { product_id },
    });
  }

  async getSold(product_id: number) {
    return this.prismaService.orderDetails.count({
      where: { product_id, status: { in: ['DELIVERED', 'COMPLETED'] } },
    });
  }

  async getTotalProductByCategory(category_name: string): Promise<number> {
    return this.prismaService.product.count({
      where: { categories: { name: category_name }, isDeleted: false },
    });
  }

  async getProductByCategory(
    req: GetProductByCategoryRequest,
  ): Promise<ProductPublicResponse[]> {
    return this.prismaService.product.findMany({
      where: {
        categories: {
          name: req.category_name,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        price: true,
        image_url: true,
      },
      take: req.size,
      skip: req.page,
    });
  }

  async getTotalDataProductPopular(): Promise<number> {
    const totalProducts = await this.prismaService.$queryRaw`
      SELECT DISTINCT COUNT(p.id) AS total
      FROM products AS p
      LEFT JOIN order_details AS pd ON p.id = pd.product_id
      LEFT JOIN (
        SELECT product_id
        FROM reviews
        GROUP BY product_id
      ) AS r ON p.id = r.product_id
      LEFT JOIN (
        SELECT product_id
        FROM order_details
        WHERE status IN ('COMPLETED', 'DELIVERED')
        GROUP BY product_id
      ) AS o ON p.id = o.product_id
      WHERE p.isDeleted = false;
    `;

    return Number(totalProducts[0].total);
  }

  async getProductPopular(req: SearchProductRequest) {
    return this.prismaService.$queryRaw`
      SELECT DISTINCT
        p.id,
        p.name,
        p.image_url,
        p.price,
        COALESCE(r.review_count, 0) AS review_count,
        COALESCE(o.order_count, 0) AS order_count,
        p.created_at
      FROM
        products p
      LEFT JOIN
        order_details pd ON p.id = pd.product_id
      LEFT JOIN
        (
          SELECT
            product_id,
            COUNT(*) AS review_count
          FROM
            reviews
          GROUP BY
            product_id
        ) r ON p.id = r.product_id
      LEFT JOIN
        (
          SELECT
            product_id,
            COUNT(*) AS order_count
          FROM
            order_details
          WHERE
            status IN ('COMPLETED', 'DELIVERED')
          GROUP BY
            product_id
        ) o ON p.id = o.product_id
      WHERE
        p.isDeleted = false
      ORDER BY
        order_count DESC,
        review_count DESC,
        p.created_at DESC
      LIMIT ${req.size} OFFSET ${req.page};
    `;
  }
}
