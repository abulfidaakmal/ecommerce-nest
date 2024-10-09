import { Module } from '@nestjs/common';
import { CategoryPublicService } from './category-public.service';
import { CategoryPublicRepository } from './category-public.repository';
import { CategoryPublicController } from './category-public.controller';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [CategoryModule],
  providers: [CategoryPublicService, CategoryPublicRepository],
  controllers: [CategoryPublicController],
})
export class CategoryPublicModule {}
