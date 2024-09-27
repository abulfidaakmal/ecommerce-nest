import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'info',
      transports: [new winston.transports.Console({})],
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    CloudinaryService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: 'cloudinary',
      useFactory: () => {
        return cloudinary.config({
          cloud_name: process.env.CLOUD_NAME,
          api_key: process.env.CLOUD_API_KEY,
          api_secret: process.env.CLOUD_API_SECRET,
        });
      },
    },
  ],
  exports: [PrismaService, ValidationService, CloudinaryService],
})
export class CommonModule {}
