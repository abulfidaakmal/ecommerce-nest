import { z, ZodType } from 'zod';

export class OrderSellerValidation {
  static readonly SEARCH: ZodType = z.object({
    search: z.string().trim().optional(),
    status: z
      .enum([
        'COMPLETED',
        'CANCELLED',
        'CANCELLEDBYSELLER',
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
      ])
      .default('PENDING'),
    page: z.coerce.number().positive().default(1),
    size: z.coerce.number().positive().max(100).default(10),
  });

  static readonly UPDATE: ZodType = z.object({
    order_id: z.coerce.number().positive(),
    product_id: z.coerce.number().positive(),
    status: z.enum([
      'CANCELLEDBYSELLER',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
    ]),
  });
}
