import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
} from '../../model/product.model';
import { ElasticService } from '../elastic/elastic.service';
import { UpdateProductElastic } from '../../model/elastic.model';

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

  async isProductExists(username: string, product_id: number): Promise<number> {
    return this.prismaService.product.count({
      where: { username, id: product_id },
    });
  }

  async getById(username: string, product_id: number) {
    return this.prismaService.product.findFirst({
      where: { username, id: product_id },
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
        isDeleted: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async update(product_id: number, req: UpdateProductRequest) {
    return this.prismaService.$transaction(async (prisma) => {
      const product = await prisma.product.update({
        where: { id: product_id },
        data: req,
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

      const elasticFields = ['name', 'description', 'price', 'image_url'];
      const doc: UpdateProductElastic = {};

      for (const field of elasticFields) {
        if (req[field]) {
          doc[field] = product[field];
        }
      }

      await this.elasticService.update(product_id, doc);

      return product;
    });
  }

  async remove(username: string, product_id: number) {
    await this.prismaService.$transaction(async (prisma) => {
      await prisma.product.update({
        where: { username, id: product_id },
        data: { isDeleted: true },
      });

      await this.elasticService.remove(product_id);
    });
  }
}
