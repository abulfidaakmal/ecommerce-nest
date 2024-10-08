import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  CreateProductElastic,
  UpdateProductElastic,
} from '../../model/elastic.model';
import { SearchProductRequest } from '../../model/product-public.model';

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

  async update(product_id: number, req: UpdateProductElastic): Promise<void> {
    await this.elasticsearchService.update({
      index: this.index,
      id: product_id.toString(),
      doc: req,
    });
  }

  async remove(product_id: number): Promise<void> {
    await this.elasticsearchService.update({
      index: this.index,
      id: product_id.toString(),
      doc: {
        isDeleted: true,
      },
    });
  }

  async getTotalData(search: string): Promise<number> {
    const total = await this.elasticsearchService.count({
      index: this.index,
      query: {
        bool: {
          must_not: [
            {
              term: {
                isDeleted: true,
              },
            },
          ],
          should: [
            {
              fuzzy: {
                name: {
                  value: search,
                  fuzziness: 'AUTO',
                  prefix_length: 0,
                },
              },
            },
            {
              multi_match: {
                query: search,
                fields: ['name', 'description'],
              },
            },
            {
              match: {
                name: {
                  query: search,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                description: {
                  query: search,
                  fuzziness: 'AUTO',
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    });

    return total.count;
  }

  async search(req: SearchProductRequest): Promise<any> {
    return this.elasticsearchService.search({
      index: this.index,
      from: req.page,
      size: req.size,
      query: {
        bool: {
          must_not: [
            {
              term: {
                isDeleted: true,
              },
            },
          ],
          should: [
            {
              fuzzy: {
                name: {
                  value: req.search,
                  fuzziness: 'AUTO',
                  prefix_length: 0,
                },
              },
            },
            {
              multi_match: {
                query: req.search,
                fields: ['name', 'description'],
              },
            },
            {
              match: {
                name: {
                  query: req.search,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                description: {
                  query: req.search,
                  fuzziness: 'AUTO',
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    });
  }
}
