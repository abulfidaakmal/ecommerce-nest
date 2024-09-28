import { Body, Controller, Delete, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserRequest } from '../../model/auth.model';
import { Response } from 'express';
import { ResponseModel } from '../../model/response.model';
import { Auth } from '../../common/auth.decorator';

@Controller('/api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() req: LoginUserRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseModel<string>> {
    const result: string = await this.authService.login(req);

    res.cookie('access_token', result, {
      expires: new Date(new Date().getTime() + 86400 * 30 * 1000),
    });

    return {
      data: 'OK',
    };
  }

  @Delete('/logout')
  async logout(
    @Auth() username: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseModel<string>> {
    await this.authService.logout(username);
    res.clearCookie('access_token');

    return {
      data: 'OK',
    };
  }
}
