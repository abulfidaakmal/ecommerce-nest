import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly CREATE: ZodType = z.array(
    z.object({
      product_id: z.coerce.number().min(1).positive(),
      quantity: z.coerce.number().min(1).positive().default(1),
    }),
  );
}
