import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  CreateReviewRequest,
  GetAllReviewRequest,
  ReviewResponse,
  UpdateReviewRequest,
} from '../../model/review.model';
import { ResponseModel } from '../../model/response.model';
import { Auth } from '../../common/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../common/cloudinary.service';

@Controller('/api/reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Auth() username: string,
    @Body() req: CreateReviewRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<ReviewResponse>> {
    if (file) {
      req.image_url = await this.cloudinaryService.upload(file, {
        folder: 'reviews',
        width: 400,
        height: 400,
      });
    }

    const result: ReviewResponse = await this.reviewService.create(
      username,
      req,
    );

    return {
      data: result,
    };
  }

  @Get()
  async getAll(
    @Auth() username: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
  ): Promise<ResponseModel<ReviewResponse[]>> {
    const req: GetAllReviewRequest = { page, size };

    return this.reviewService.getAll(username, req);
  }

  @Patch('/:reviewId')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Auth() username: string,
    @Body() req: UpdateReviewRequest,
    @Param('reviewId', ParseIntPipe) review_id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseModel<ReviewResponse>> {
    if (file) {
      req.image_url = await this.cloudinaryService.upload(file, {
        folder: 'reviews',
        width: 400,
        height: 400,
      });
    }

    const result: ReviewResponse = await this.reviewService.update(
      username,
      review_id,
      req,
    );

    return {
      data: result,
    };
  }
}
