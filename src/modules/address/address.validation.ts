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

  static readonly SEARCH: ZodType = z.object({
    search: z.string().min(1).optional(),
    page: z.coerce.number().min(1).positive().default(1),
    size: z.coerce.number().min(1).max(50).positive().default(10),
  });
}
