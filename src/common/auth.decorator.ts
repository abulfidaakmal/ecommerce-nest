import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const username = req.username as string;

    if (username) {
      return username;
    } else {
      throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);
    }
  },
);
