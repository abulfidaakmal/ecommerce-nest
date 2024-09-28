import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../../model/user.model';
import { ValidationService } from '../../common/validation.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly validationService: ValidationService,
  ) {}

  private async isUsernameAlreadyExists(username: string): Promise<void> {
    const check: number =
      await this.userRepository.isUsernameAlreadyExists(username);

    if (check) {
      throw new HttpException(
        'username already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async isEmailAlreadyExists(email: string): Promise<void> {
    const check: number = await this.userRepository.isEmailAlreadyExists(email);

    if (check) {
      throw new HttpException('email already exists', HttpStatus.BAD_REQUEST);
    }
  }

  private async isPhoneAlreadyExists(phone: string): Promise<void> {
    const check: number = await this.userRepository.isPhoneAlreadyExists(phone);

    if (check) {
      throw new HttpException('phone already exists', HttpStatus.BAD_REQUEST);
    }
  }

  async register(req: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Register request: ${JSON.stringify(req)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, req);

    await this.isUsernameAlreadyExists(registerRequest.username);
    await this.isEmailAlreadyExists(registerRequest.email);
    await this.isPhoneAlreadyExists(registerRequest.phone);

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    return this.userRepository.register(registerRequest);
  }

  async get(username: string): Promise<UserResponse> {
    this.logger.info(`Get user request: ${username}`);

    return this.userRepository.get(username);
  }

  async update(
    username: string,
    req: UpdateUserRequest,
  ): Promise<UserResponse> {
    this.logger.info(`Update user request: ${JSON.stringify(req)}`);
    const updateRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      req,
    );

    if (updateRequest.email) {
      await this.isEmailAlreadyExists(updateRequest.email);
    }

    if (updateRequest.phone) {
      await this.isPhoneAlreadyExists(updateRequest.phone);
    }

    return this.userRepository.update(username, req);
  }
}
