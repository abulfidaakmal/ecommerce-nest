import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    street: z.string().trim().min(3).max(255),
    city: z.string().trim().min(3).max(100),
    province: z.string().trim().min(3).max(100),
    postal_code: z.string().trim().min(3).max(10),
    detail: z.string().trim().min(3).optional(),
    name: z.string().trim().min(3).max(100),
    phone: z.string().trim().min(4).max(20),
  });
}