import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth } from '../../common/auth.decorator';
import {
  CreateProductRequest,
  ProductDetailResponse,
  ProductResponse,
  SearchProductRequest,
  UpdateProductRequest,
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

  @Get()
  async search(
    @Auth() username: string,
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    @Query('isDeleted', new DefaultValuePipe(false), ParseBoolPipe)
    isDeleted: boolean,
  ): Promise<ResponseModel<ProductResponse[]>> {
    const req: SearchProductRequest = { search, page, size, isDeleted };

    return this.productService.search(username, req);
  }

  @Get('/:productId')
  @Roles('SELLER', 'ADMIN')
  async getById(
    @Auth() username: string,
    @Param('productId', ParseIntPipe) product_id: number,
  ): Promise<ResponseModel<ProductDetailResponse>> {
    const result: ProductDetailResponse = await this.productService.getById(
      username,
      product_id,
    );

    return {
      data: result,
    };
  }

  @Patch('/:productId')
  @Roles('SELLER', 'ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Auth() username: string,
    @Param('productId', ParseIntPipe) product_id: number,
    @Body() req: UpdateProductRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<ProductResponse>> {
    if (file) {
      req.image_url = await this.cloudinaryService.upload(file, {
        folder: 'products',
        width: 400,
        height: 400,
      });
    }

    const result: ProductResponse = await this.productService.update(
      username,
      product_id,
      req,
    );

    return {
      data: result,
    };
  }

  @Delete('/:productId')
  @Roles('SELLER', 'ADMIN')
  async remove(
    @Auth() username: string,
    @Param('productId', ParseIntPipe) product_id: number,
  ): Promise<ResponseModel<string>> {
    const result: string = await this.productService.remove(
      username,
      product_id,
    );

    return {
      data: result,
    };
  }
}
