export class SellerResponse {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export class RegisterSellerRequest {
  name: string;
  description: string;
  address_id: number;
}

export class UpdateSellerRequest {
  name?: string;
  description?: string;
}
