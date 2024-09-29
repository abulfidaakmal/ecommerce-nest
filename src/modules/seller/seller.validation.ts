import { z, ZodType } from 'zod';

export class SellerValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().trim().min(3).max(100),
    description: z.string().trim().min(10),
    address_id: z.coerce.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().trim().min(3).max(100).optional(),
    description: z.string().trim().min(10).optional(),
  });
}
