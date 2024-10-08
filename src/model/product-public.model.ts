import { Condition } from '@prisma/client';

export class ProductByIdResponse {
  product: {
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
    total_sold: number;
    total_rating: number;
  };
  seller: {
    name: string;
    avatar: string;
    rating_percentage: string;
    city: string;
    province: string;
  };
}
