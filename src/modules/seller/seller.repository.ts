import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  RegisterSellerRequest,
  SellerResponse,
} from '../../model/seller.model';

@Injectable()
export class SellerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async hasBeenSeller(username: string): Promise<number> {
    return this.prismaService.user.count({
      where: { username, has_been_seller: true },
    });
  }

  async isNameAlreadyExists(name: string): Promise<number> {
    return this.prismaService.seller.count({
      where: { name },
    });
  }

  async register(
    username: string,
    req: RegisterSellerRequest,
  ): Promise<SellerResponse> {
    return this.prismaService.$transaction(async (prisma) => {
      const seller = await prisma.seller.create({
        data: {
          ...req,
          username,
        },
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true,
          updated_at: true,
        },
      });

      await prisma.user.update({
        where: { username },
        data: {
          role: 'SELLER',
          has_been_seller: true,
        },
      });

      return seller;
    });
  }

  async get(username: string): Promise<SellerResponse> {
    return this.prismaService.seller.findFirst({
      where: {
        username,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
