import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async removeAllUser() {
    await this.prismaService.user.deleteMany({
      where: {
        first_name: 'test',
      },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        first_name: 'test',
        last_name: 'test',
        email: 'test@gmail.com',
        phone: '092019101',
        password: await bcrypt.hash('test', 10),
        gender: 'MALE',
        avatar: 'test',
        birth_of_date: '2006-06-09T00:00:00.000Z',
      },
    });
  }

  async removeAllAddress() {
    await this.prismaService.address.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createAddress() {
    await this.prismaService.address.create({
      data: {
        street: 'test',
        city: 'test',
        province: 'test',
        postal_code: 'test',
        detail: 'test',
        name: 'test',
        phone: 'test',
        username: 'test',
      },
    });
  }

  async getAddressId() {
    const address = await this.prismaService.address.findFirst({
      where: { username: 'test' },
      select: { id: true },
    });

    return address.id;
  }

  async selectAddress(address_id: number) {
    await this.prismaService.address.update({
      where: {
        username: 'test',
        id: address_id,
      },
      data: {
        is_selected: true,
      },
    });
  }

  async getAddressSelected() {
    const address = await this.prismaService.address.findFirst({
      where: { username: 'test', is_selected: true },
      select: { id: true },
    });

    return address.id;
  }

  async removeAllSeller() {
    await this.prismaService.seller.deleteMany({
      where: { username: 'test' },
    });
  }

  async createSeller() {
    const addressId = await this.getAddressId();

    await this.prismaService.seller.create({
      data: {
        username: 'test',
        name: 'test',
        description: 'test',
        address_id: addressId,
      },
    });
  }

  async getUserRole() {
    return this.prismaService.user.findFirst({
      where: { username: 'test' },
      select: {
        role: true,
        has_been_seller: true,
      },
    });
  }

  async updateUserToSellerRole() {
    await this.prismaService.user.update({
      where: { username: 'test' },
      data: {
        role: 'SELLER',
        has_been_seller: true,
      },
    });
  }
}
