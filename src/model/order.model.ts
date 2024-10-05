export class OrderResponse {
  order: {
    id: number;
    total_price: number;
    total_quantity: number;
  };
  product: {
    id: number;
    name: string;
    image_url: string;
    price: number;
    quantity: number;
    status: string;
    seller_name: string;
  }[];
  created_at: Date;
  updated_at: Date;
}

export class CreateOrderRequest {
  product_id: number;
  quantity: number;
}
