import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().trim().min(4).max(100),
    first_name: z.string().trim().min(3).max(100),
    last_name: z.string().trim().min(3).max(100).optional(),
    email: z.string().trim().email().max(100),
    phone: z.string().trim().min(4).max(20),
    password: z.string().trim().min(4).max(100),
    birth_of_date: z.coerce.date().max(new Date()),
    gender: z.enum(['MALE', 'FEMALE']),
    avatar: z.string().max(255),
  });

  static readonly UPDATE: ZodType = z.object({
    first_name: z.string().trim().min(3).max(100).optional(),
    last_name: z.string().trim().min(3).max(100).optional(),
    email: z.string().trim().email().max(100).optional(),
    phone: z.string().trim().min(4).max(20).optional(),
    avatar: z.string().max(255).optional(),
  });
}
