import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { JsonWebTokenError } from '@nestjs/jwt';

@Catch(ZodError, HttpException, JsonWebTokenError)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        errors: exception.errors,
      });
    } else if (exception instanceof JsonWebTokenError) {
      response.status(401).json({
        errors: 'unauthorized',
      });
    }
  }
}
