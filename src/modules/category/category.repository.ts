import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CategoryResponse,
  CreateCategoryRequest,
  GetAllCategoryRequest,
} from '../../model/category.model';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isNameAlreadyExists(name: string): Promise<number> {
    return this.prismaService.category.count({
      where: { name },
    });
  }

  async create(
    username: string,
    req: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    return this.prismaService.category.create({
      data: {
        username,
        name: req.name,
      },
      select: {
        id: true,
        name: true,
        username: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async getAll(req: GetAllCategoryRequest): Promise<CategoryResponse[]> {
    return this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        created_at: true,
        updated_at: true,
      },
      take: req.size,
      skip: req.page,
    });
  }

  async getTotalCategory(): Promise<number> {
    return this.prismaService.category.count({});
  }
}
