export class CreateProductElastic {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

export class UpdateProductElastic {
  name?: string;
  description?: string;
  image_url?: string;
  price?: number;
}
