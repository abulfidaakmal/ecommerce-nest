import { HttpException, Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { LoginUserRequest } from '../../model/auth.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../../common/validation.service';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly authRepository: AuthRepository,
    private readonly validationService: ValidationService,
    private readonly jwtService: JwtService,
  ) {}

  async login(req: LoginUserRequest): Promise<string> {
    this.logger.info(`Login request: ${req.email}`);
    const loginRequest: LoginUserRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      req,
    );

    const isUserExists: { username: string; password: string } =
      await this.authRepository.isUserExists(loginRequest.email);

    if (!isUserExists) {
      throw new HttpException('email or password is wrong', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      isUserExists.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('email or password is wrong', 401);
    }

    return this.jwtService.sign({ username: isUserExists.username });
  }

  async logout(username: string): Promise<void> {
    this.logger.info(`Logout request: ${username}`);
  }
}
