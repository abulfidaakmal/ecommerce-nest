import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth } from '../../common/auth.decorator';
import {
  CreateProductRequest,
  ProductResponse,
} from '../../model/product.model';
import { ResponseModel } from '../../model/response.model';
import { Roles } from '../../common/roles.decorator';
import { CloudinaryService } from '../../common/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles('SELLER', 'ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Auth() username: string,
    @Body() req: CreateProductRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<ProductResponse>> {
    req.image_url = await this.cloudinaryService.upload(
      file,
      {
        folder: 'products',
        width: 400,
        height: 400,
      },
      true,
    );

    const result: ProductResponse = await this.productService.create(
      username,
      req,
    );

    return {
      data: result,
    };
  }
}
