import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CategoryPublicResponse,
  GetAllCategoryRequest,
} from '../../model/category-public.model';

@Injectable()
export class CategoryPublicRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(req: GetAllCategoryRequest): Promise<CategoryPublicResponse[]> {
    return this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
      take: req.size,
      skip: req.page,
    });
  }
}
