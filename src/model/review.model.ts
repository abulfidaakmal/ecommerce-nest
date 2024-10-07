export class ReviewResponse {
  id: number;
  rating: number;
  summary?: string;
  image_url?: string;
  product_image: string;
  product_name: string;
  product_id: number;
  created_at: Date;
  updated_at: Date;
}

export class CreateReviewRequest {
  rating: number;
  summary?: string;
  image_url?: string;
  product_id: number;
}

export class GetAllReviewRequest {
  page: number;
  size: number;
}
