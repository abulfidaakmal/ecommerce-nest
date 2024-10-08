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

export class SearchOrderSellerRequest {
  search: string;
  status?: Status;
  page: number;
  size: number;
}
