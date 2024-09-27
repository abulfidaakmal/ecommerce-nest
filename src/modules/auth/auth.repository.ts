import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async isUserExists(
    email: string,
  ): Promise<{ username: string; password: string }> {
    return this.prismaService.user.findFirst({
      where: { email },
      select: {
        username: true,
        password: true,
      },
    });
  }
}
