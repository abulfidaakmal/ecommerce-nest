import { Gender, Role } from '@prisma/client';

export class UserResponse {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_of_date: Date;
  gender: Gender;
  avatar: string;
  role: Role;
  has_been_seller: boolean;
  created_at: Date;
  updated_at: Date;
}

export class RegisterUserRequest {
  username: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
  password: string;
  birth_of_date: Date;
  gender: Gender;
  avatar: string;
}
