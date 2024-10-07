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

export class OrderDetailResponse {
  order: {
    id: number;
    price: number;
    quantity: number;
    total: number;
    status: string;
    address: {
      id: number;
      street: string;
      city: string;
      province: string;
      postal_code: string;
      name: string;
      phone: string;
    };
  };
  product: {
    id: number;
    name: string;
    image_url: string;
    weight: number;
    seller: {
      name: string;
      city: string;
      province: string;
    };
  };
  created_at: Date;
  updated_at: Date;
}

export class CreateOrderRequest {
  product_id: number;
  quantity: number;
}

export class GetAllOrderRequest {
  status?: string;
  page: number;
  size: number;
}

export class GetOrderDetailRequest {
  order_id: number;
  product_id: number;
}
