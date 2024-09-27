import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RegisterUserRequest, UserResponse } from '../../model/user.model';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isUsernameAlreadyExists(username: string): Promise<number> {
    return this.prismaService.user.count({
      where: { username },
    });
  }

  async isEmailAlreadyExists(email: string): Promise<number> {
    return this.prismaService.user.count({
      where: { email },
    });
  }

  async isPhoneAlreadyExists(phone: string): Promise<number> {
    return this.prismaService.user.count({
      where: { phone },
    });
  }

  async register(req: RegisterUserRequest): Promise<UserResponse> {
    return this.prismaService.user.create({
      data: req,
      select: {
        username: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        birth_of_date: true,
        gender: true,
        avatar: true,
        role: true,
        has_been_seller: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
