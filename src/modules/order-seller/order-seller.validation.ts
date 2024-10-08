import { z, ZodType } from 'zod';

export class OrderSellerValidation {
  static readonly SEARCH: ZodType = z.object({
    search: z.string().trim().optional(),
    status: z.string().min(7).max(17).optional().default('PENDING'),
    page: z.coerce.number().positive().default(1),
    size: z.coerce.number().positive().max(100).default(10),
  });
}
