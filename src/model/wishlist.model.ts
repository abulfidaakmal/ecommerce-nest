export class WishlistResponse {
  id: number;
  product_id: number;
  name: string;
  image_url: string;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export class CreateWishlistRequest {
  product_id: number;
}

export class GetAllWishlistRequest {
  page: number;
  size: number;
}
