import { z, ZodType } from 'zod';

export class ReviewValidation {
  static readonly CREATE: ZodType = z.object({
    rating: z.coerce.number().int().min(1).max(5).default(5),
    summary: z.string().trim().min(5).optional(),
    image_url: z.string().max(255).optional(),
    product_id: z.coerce.number().min(1).positive(),
  });

  static readonly GET: ZodType = z.object({
    page: z.coerce.number().positive().default(1),
    size: z.coerce.number().positive().max(50).default(10),
  });
}
