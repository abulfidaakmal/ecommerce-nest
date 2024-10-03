import { Condition } from '@prisma/client';

export class ProductResponse {
  id: number;
  name: string;
  image_url: string;
  price: number;
  stock: number;
  category_name: string;
  isDeleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CreateProductRequest {
  name: string;
  description: string;
  image_url: string;
  price: number;
  stock: number;
  weight: number;
  condition: Condition;
  category_id: number;
  sku: string;
}
