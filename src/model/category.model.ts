export class CategoryResponse {
  id: number;
  name: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export class CreateCategoryRequest {
  name: string;
}

export class GetAllCategoryRequest {
  page?: number;
  size?: number;
}
