import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly CREATE: ZodType = z.array(
    z.object({
      product_id: z.coerce.number().min(1).positive(),
      quantity: z.coerce.number().min(1).positive().default(1),
    }),
  );

  static readonly GET: ZodType = z.object({
    status: z.enum(['ONGOING', 'COMPLETED', 'CANCELLED']).default('ONGOING'),
    page: z.coerce.number().min(1).positive().default(1),
    size: z.coerce.number().min(1).max(50).positive().default(10),
  });
}
