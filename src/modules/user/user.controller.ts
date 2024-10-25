import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseModel } from '../../model/response.model';
import {
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../../model/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../common/cloudinary.service';
import { Auth } from '../../common/auth.decorator';

@Controller('/api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Body() req: RegisterUserRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<UserResponse>> {
    if (file) {
      req.avatar = await this.cloudinaryService.upload(file, {
        folder: 'avatars',
        width: 200,
        height: 200,
      });
    } else {
      req.avatar = `https://api.dicebear.com/6.x/thumbs/svg?seed=${req.username}`;
    }

    const result: UserResponse = await this.userService.register(req);

    return {
      data: result,
    };
  }

  @Get()
  async get(@Auth() username: string): Promise<ResponseModel<UserResponse>> {
    const result: UserResponse = await this.userService.get(username);

    return {
      data: result,
    };
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Auth() username: string,
    @Body() req: UpdateUserRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<UserResponse>> {
    if (file) {
      req.avatar = await this.cloudinaryService.upload(file, {
        folder: 'avatars',
        width: 200,
        height: 200,
      });
    }

    const result: UserResponse = await this.userService.update(username, req);

    return {
      data: result,
    };
  }
}
