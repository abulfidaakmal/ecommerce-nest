import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: string[] = this.reflector.get('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const username = context.switchToHttp().getRequest().username;

    const user = await this.prismaService.user.findFirst({
      where: { username },
      select: { role: true },
    });

    if (!roles.includes(user.role)) {
      throw new HttpException('forbidden', 403);
    }

    return true;
  }
}
