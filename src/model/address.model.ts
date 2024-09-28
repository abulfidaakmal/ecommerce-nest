export class AddressResponse {
  id: number;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  detail?: string;
  is_selected: boolean;
  is_sellers: boolean;
  name: string;
  phone: string;
}

export class CreateAddressRequest {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  detail?: string;
  name: string;
  phone: string;
  is_selected: boolean;
}
