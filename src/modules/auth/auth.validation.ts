import { Injectable } from '@nestjs/common';
import { z, ZodType } from 'zod';

@Injectable()
export class AuthValidation {
  static readonly LOGIN: ZodType = z.object({
    email: z.string().email().max(100),
    password: z.string().max(20),
  });
}
