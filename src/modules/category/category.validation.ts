import { z, ZodType } from 'zod';

export class CategoryValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().trim().min(3).max(100),
  });
}
