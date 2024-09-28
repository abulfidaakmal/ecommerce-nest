import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: any, res: any, next: (error?: Error | any) => void) {
    const cookie = req.cookies['access_token'] as string;

    if (cookie) {
      const decode = await this.jwtService.verify(cookie, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prismaService.user.findFirst({
        where: {
          username: decode.username,
        },
        select: {
          username: true,
        },
      });

      if (user) {
        req.username = user.username;
      }
    }

    next();
  }
}
