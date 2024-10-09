import { z, ZodType } from 'zod';

export class CategoryPublicValidation {
  static readonly GET: ZodType = z.object({
    page: z.coerce.number().min(1).positive().default(1),
    size: z.coerce.number().min(1).max(100).positive().default(25),
  });
}
