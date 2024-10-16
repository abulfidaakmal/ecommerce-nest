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
    total_review: number;
  };
  seller: {
    name: string;
    avatar: string;
    rating_percentage: string;
    city: string;
    province: string;
  };
}

export class ProductPublicResponse {
  id: number;
  name: string;
  image_url: string;
  price: number;
}

export class ProductReviewResponse {
  id: number;
  username: string;
  avatar: string;
  rating: number;
  summary?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class RatingDistributionResponse {
  average: number;
  percentage: string;
  total_rating: number;
  total_review: number;
  ratings: {
    rating: number;
    total: number;
  }[];
}

export class GetProductByCategoryRequest {
  category_name: string;
  page: number;
  size: number;
}

export class SearchProductRequest {
  search?: string;
  page: number;
  size: number;
}

export class ProductReviewRequest {
  product_id: number;
  page: number;
  size: number;
}
