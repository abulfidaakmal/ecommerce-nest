import { z, ZodType } from 'zod';

export class WishlistValidation {
  static readonly CREATE: ZodType = z.object({
    product_id: z.coerce.number().min(1).positive(),
  });

  static readonly GET: ZodType = z.object({
    page: z.coerce.number().positive().default(1),
    size: z.coerce.number().positive().max(100).default(10),
  });
}
