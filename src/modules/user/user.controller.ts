import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseModel } from '../../model/response.model';
import { RegisterUserRequest, UserResponse } from '../../model/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../common/cloudinary.service';

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
}
