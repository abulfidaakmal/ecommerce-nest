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
}
