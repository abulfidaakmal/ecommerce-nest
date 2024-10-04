import { z, ZodType } from 'zod';

export class WishlistValidation {
  static readonly CREATE: ZodType = z.object({
    product_id: z.coerce.number().min(1).positive(),
  });
}
