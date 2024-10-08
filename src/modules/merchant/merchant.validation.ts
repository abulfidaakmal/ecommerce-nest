import { z, ZodType } from 'zod';

export class MerchantValidation {
  static readonly GET: ZodType = z.object({
    merchantName: z.string().trim().min(1),
    page: z.coerce.number().positive().default(1),
    size: z.coerce.number().positive().max(100).default(60),
  });
}
