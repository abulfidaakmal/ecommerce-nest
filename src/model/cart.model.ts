export class CartResponse {
  cart: {
    id: number;
    quantity: number;
    total: number;
  };
  product: {
    id: number;
    name: string;
    image_url: string;
    price: number;
    stock: number;
    seller_name: string;
  };
  created_at: Date;
  updated_at: Date;
}

export class CreateCartRequest {
  product_id: number;
  quantity: number;
}

export class UpdateCartRequest {
  cart_id: number;
  quantity: number;
}
