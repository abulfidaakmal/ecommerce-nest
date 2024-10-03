import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProductRequest } from '../../model/product.model';
import { ElasticService } from '../elastic/elastic.service';

@Injectable()
export class ProductRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly elasticService: ElasticService,
  ) {}

  async create(username: string, req: CreateProductRequest) {
    return this.prismaService.$transaction(async (prisma) => {
      const product = await prisma.product.create({
        data: {
          username,
          ...req,
        },
        select: {
          id: true,
          name: true,
          description: true,
          image_url: true,
          price: true,
          stock: true,
          isDeleted: true,
          created_at: true,
          updated_at: true,
          categories: {
            select: {
              name: true,
            },
          },
        },
      });

      await this.elasticService.createProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image_url: product.image_url,
      });

      return product;
    });
  }
}
