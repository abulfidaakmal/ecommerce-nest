import { Status } from '@prisma/client';

export class OrderSellerResponse {
  order: {
    id: number;
    customer: string;
    price: number;
    quantity: number;
    status: string;
  };
  product: {
    id: number;
    name: string;
    image_url: string;
  };
  created_at: Date;
  updated_at: Date;
}

export class OrderSellerDetailResponse {
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
      detail: string;
      name: string;
      phone: string;
    };
  };
  product: {
    id: number;
    name: string;
    image_url: string;
    weight: number;
  };
  created_at: Date;
  updated_at: Date;
}

export class SearchOrderSellerRequest {
  search: string;
  status?: Status;
  page: number;
  size: number;
}

export class GetOrderDetailRequest {
  order_id: number;
  product_id: number;
}
