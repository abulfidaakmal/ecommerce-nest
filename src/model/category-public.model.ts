export class CategoryPublicResponse {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export class GetAllCategoryRequest {
  page: number;
  size: number;
}
