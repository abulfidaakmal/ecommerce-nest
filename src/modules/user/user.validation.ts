import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().max(100),
    first_name: z.string().max(100),
    last_name: z.string().max(100).optional(),
    email: z.string().email().max(100),
    phone: z.string().max(20),
    password: z.string().max(100),
    birth_of_date: z.coerce.date().max(new Date()),
    gender: z.enum(['MALE', 'FEMALE']),
    avatar: z.string().max(255),
  });
}
