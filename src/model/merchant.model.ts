export class MerchantInfoResponse {
  seller: {
    name: string;
    description: string;
    avatar: string;
    created_at: Date;
  };
  address: {
    city: string;
    province: string;
  };
  rating: {
    percentage: string;
    total: number;
  };
  product: {
    total: number;
    complete: number;
  };
}

export class ProductMerchantResponse {
  id: number;
  name: string;
  image_url: string;
  price: number;
}

export class GetProductMerchantRequest {
  merchantName: string;
  page: number;
  size: number;
}
