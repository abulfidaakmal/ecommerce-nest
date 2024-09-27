import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';

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
        password: 'test',
        gender: 'MALE',
        avatar: 'test',
        birth_of_date: '2006-06-09T00:00:00.000Z',
      },
    });
  }
}
