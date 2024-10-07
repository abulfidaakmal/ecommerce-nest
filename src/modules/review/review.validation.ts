import { z, ZodType } from 'zod';

export class ReviewValidation {
  static readonly CREATE: ZodType = z.object({
    rating: z.coerce.number().int().min(1).max(5).default(5),
    summary: z.string().trim().min(5).optional(),
    image_url: z.string().max(255).optional(),
    product_id: z.coerce.number().min(1).positive(),
  });
}
