import { HttpException, Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  UploadStream,
  v2 as cloudinary,
} from 'cloudinary';

const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  async upload(
    file: Express.Multer.File,
    config: { folder: string; width: number; height: number },
    required = false,
  ): Promise<string> {
    if (required && !file) {
      throw new HttpException('image is required', 400);
    }

    if (file.size > 3 * 1024 * 1024) {
      throw new HttpException(
        'File size must be less than or equal to 3MB',
        400,
      );
    }

    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
      throw new HttpException('Only jpeg, jpg, and png files are allowed', 400);
    }

    return new Promise((resolve, reject) => {
      const upload: UploadStream = cloudinary.uploader.upload_stream(
        {
          folder: config.folder,
          resource_type: 'image',
          format: 'jpg',
          transformation: [
            {
              width: config.width,
              height: config.height,
            },
          ],
        },
        (err: UploadApiErrorResponse, res: UploadApiResponse) => {
          if (err) return reject(err);
          resolve(res.url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}
