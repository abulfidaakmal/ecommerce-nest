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

export class ProductDetailResponse {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  stock: number;
  sku: string;
  weight: number;
  condition: Condition;
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

export class SearchProductRequest {
  search: string;
  isDeleted: boolean;
  page: number;
  size: number;
}

export class UpdateProductRequest {
  name?: string;
  description?: string;
  image_url?: string;
  category_id?: number;
  price?: number;
  stock?: number;
  weight?: number;
  condition?: Condition;
}
