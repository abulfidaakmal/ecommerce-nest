export class ResponseModel<T> {
  data: T;
  errors?: any;
  paging?: Paging;
}

class Paging {
  size: number;
  current_page: number;
  total_data: number;
  total_page: number;
}
