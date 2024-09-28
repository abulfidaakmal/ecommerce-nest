import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  AddressResponse,
  CreateAddressRequest,
} from '../../model/address.model';

@Injectable()
export class AddressRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isSelectedAddressAlreadyExists(username: string): Promise<number> {
    return this.prismaService.address.count({
      where: { username, is_selected: true },
    });
  }

  async create(
    username: string,
    req: CreateAddressRequest,
  ): Promise<AddressResponse> {
    return this.prismaService.address.create({
      data: {
        ...req,
        username: username,
      },
      select: {
        id: true,
        street: true,
        city: true,
        province: true,
        postal_code: true,
        detail: true,
        name: true,
        phone: true,
        is_selected: true,
        is_sellers: true,
      },
    });
  }
}
