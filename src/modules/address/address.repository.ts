import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  AddressResponse,
  CreateAddressRequest,
  SearchAddressRequest,
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

  async getTotalAddress(where: {
    username: string;
    OR?: any;
  }): Promise<number> {
    return this.prismaService.address.count({
      where,
    });
  }

  async search(
    where: {
      username: string;
      OR?: any;
    },
    req: SearchAddressRequest,
  ): Promise<AddressResponse[]> {
    return this.prismaService.address.findMany({
      where,
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
      orderBy: [
        {
          is_sellers: 'desc',
        },
        {
          is_selected: 'desc',
        },
      ],
      skip: req.page,
      take: req.size,
    });
  }

  async isAddressExist(username: string, address_id: number): Promise<number> {
    return this.prismaService.address.count({
      where: { username, id: address_id },
    });
  }

  async update(
    address_id: number,
    req: CreateAddressRequest,
  ): Promise<AddressResponse> {
    return this.prismaService.address.update({
      where: { id: address_id },
      data: req,
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

  async remove(address_id: number): Promise<{ is_selected: boolean }> {
    return this.prismaService.address.delete({
      where: { id: address_id },
      select: {
        is_selected: true,
      },
    });
  }

  async anotherAddress(username: string): Promise<{ id: number }> {
    return this.prismaService.address.findFirst({
      where: { username },
      select: { id: true },
      orderBy: { id: 'asc' },
    });
  }

  async selectAddress(username: string, address_id: number): Promise<void> {
    await this.prismaService.$transaction(async (prisma) => {
      await prisma.address.updateMany({
        where: { username, is_selected: true },
        data: { is_selected: false },
      });

      await prisma.address.update({
        where: { username, id: address_id },
        data: { is_selected: true },
      });
    });
  }
}
