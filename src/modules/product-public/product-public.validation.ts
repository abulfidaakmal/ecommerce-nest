import { z, ZodType } from 'zod';

export class ProductPublicValidation {
  static readonly GETBYCATEGORY: ZodType = z.object({
    category_name: z.string().trim().min(1),
    page: z.coerce.number().min(1).positive().default(1),
    size: z.coerce.number().min(1).max(100).positive().default(60),
  });

  static readonly SEARCH: ZodType = z.object({
    search: z.string().trim().optional(),
    page: z.coerce.number().min(1).positive().default(1),
    size: z.coerce.number().min(1).max(100).positive().default(60),
  });
}
