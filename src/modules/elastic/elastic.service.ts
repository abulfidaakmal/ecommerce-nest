import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CreateProductElastic } from '../../model/elastic.model';

@Injectable()
export class ElasticService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  private index = 'ecommerce_products_nest';

  async createProduct(req: CreateProductElastic): Promise<void> {
    await this.elasticsearchService.index({
      index: this.index,
      id: req.id.toString(),
      document: {
        name: req.name,
        description: req.description,
        price: req.price,
        image_url: req.image_url,
        isDeleted: false,
      },
    });
  }
}