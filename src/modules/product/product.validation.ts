import { z, ZodType } from 'zod';

export class ProductValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().trim().min(5).max(100),
    description: z.string().trim().min(20),
    image_url: z.string().max(255),
    price: z.coerce.number().min(1),
    stock: z.coerce.number().min(1),
    weight: z.coerce.number().min(1),
    condition: z.enum(['NEW', 'USED', 'REFURBISHED']),
    category_id: z.coerce.number().positive(),
  });

  static readonly SEARCH: ZodType = z.object({
    search: z.string().trim().min(1).optional(),
    isDeleted: z.boolean().default(false),
    page: z.coerce.number().min(1).positive().default(1),
    size: z.coerce.number().min(1).max(50).positive().default(10),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().trim().min(5).max(100).optional(),
    description: z.string().trim().min(20).optional(),
    image_url: z.string().max(255).optional(),
    price: z.coerce.number().min(1).optional(),
    stock: z.coerce.number().min(1).optional(),
    weight: z.coerce.number().min(1).optional(),
    condition: z.enum(['NEW', 'USED', 'REFURBISHED']).optional(),
    category_id: z.coerce.number().positive().optional(),
  });
}
