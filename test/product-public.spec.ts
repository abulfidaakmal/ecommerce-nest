import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('ProductPublicController (e2e)', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    testService = app.get(TestService);

    app.use(cookieParser());

    await app.init();

    await testService.createUser();
    await testService.createAddress();
    await testService.createSeller();
    await testService.createCategory();
    await testService.createProductWithoutElastic();
  });

  afterEach(async () => {
    await testService.removeAllReview();
    await testService.removeAllWishlist();
    await testService.removeAllProductWithoutElastic();
    await testService.removeAllCategory();
    await testService.removeAllSeller();
    await testService.removeAllAddress();
    await testService.removeAllUser();
  });

  describe('/api/public/products/:productId (GET)', () => {
    it('should can get product by id', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/${productId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.product.id).toBe(productId);
      expect(response.body.data.product.name).toBe('test123');
      expect(response.body.data.product.description).toBe(
        'this is an example of a field description',
      );
      expect(response.body.data.product.image_url).toBe('test');
      expect(response.body.data.product.price).toBe(1000);
      expect(response.body.data.product.stock).toBe(1);
      expect(response.body.data.product.sku).toBe('test');
      expect(response.body.data.product.weight).toBe(1000);
      expect(response.body.data.product.condition).toBe('NEW');
      expect(response.body.data.product.category_name).toBe('test');
      expect(response.body.data.product.total_sold).toBe(0);
      expect(response.body.data.product.total_review).toBe(0);
      expect(response.body.data.seller.name).toBe('test');
      expect(response.body.data.seller.avatar).toBe('test');
      expect(response.body.data.seller.rating_percentage).toBe('0%');
      expect(response.body.data.seller.city).toBe('test');
      expect(response.body.data.seller.province).toBe('test');
    });

    it('should reject if product is not found', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/${productId + 100}`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/public/products/wrong`,
      );

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('/api/public/products/:productId/reviews (GET)', () => {
    it('should can get all reviews', async () => {
      await testService.createReview();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/public/products/${productId}/reviews`)
        .query({
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].username).toBe('test');
      expect(response.body.data[0].avatar).toBe('test');
      expect(response.body.data[0].rating).toBe(5);
      expect(response.body.data[0].summary).toBe('test');
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if request is not valid', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/public/products/${productId}/reviews`)
        .query({
          page: 'wrong',
          size: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no review available', async () => {
      await testService.removeAllReview();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/${productId}/reviews`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no review available');
    });

    it('should reject if product is not found', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/${productId + 100}/reviews`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });
  });

  describe('/api/public/products/:productId/ratings/distribution (GET)', () => {
    it('should can get all reviews', async () => {
      await testService.createReview();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/${productId}/ratings/distribution`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.average).toBe(5.0);
      expect(response.body.data.percentage).toBe('100%');
      expect(response.body.data.total_rating).toBe(5);
      expect(response.body.data.total_review).toBe(1);
      expect(response.body.data.ratings[0].rating).toBe(5);
      expect(response.body.data.ratings[0].total).toBe(1);
      expect(response.body.data.ratings[1].rating).toBe(4);
      expect(response.body.data.ratings[1].total).toBe(0);
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/public/products/wrong/ratings/distribution`,
      );

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no review available', async () => {
      await testService.removeAllReview();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/${productId}/ratings/distribution`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no review available');
    });

    it('should reject if product is not found', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/${productId + 100}/ratings/distribution`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });
  });

  describe('/api/public/products/categories/:name (GET)', () => {
    it('should can get products by category name', async () => {
      const categoryName = await testService.getCategoryName();

      const response = await request(app.getHttpServer())
        .get(`/api/public/products/categories/${categoryName}`)
        .query({
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBe('test123');
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should can get products by category name if the query does not exists', async () => {
      const categoryName = await testService.getCategoryName();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/categories/${categoryName}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBe('test123');
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(60);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if category is not found', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/public/products/categories/not found`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('category is not found');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/public/products/categories/1`)
        .query({
          page: 'wrong',
          size: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no product available', async () => {
      await testService.removeAllProductWithoutElastic();
      const categoryName = await testService.getCategoryName();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products/categories/${categoryName}`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no product available');
    });
  });

  describe('/api/public/products (GET)', () => {
    afterEach(async () => {
      await testService.removeAllProduct();
    });

    it('should can search products', async () => {
      await testService.createProduct();

      const response = await request(app.getHttpServer())
        .get(`/api/public/products`)
        .query({
          page: 1,
          size: 1,
          search: 'test',
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBe('test');
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if product is not found', async () => {
      await testService.createProduct();

      const response = await request(app.getHttpServer())
        .get(`/api/public/products`)
        .query({
          page: 1,
          size: 1,
          search: 'not found',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should can get products popular if the query does not exists', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/public/products`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBe('test123');
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(60);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/public/products`)
        .query({
          page: 'wrong',
          size: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no product available', async () => {
      await testService.removeAllProductWithoutElastic();

      const response = await request(app.getHttpServer()).get(
        `/api/public/products`,
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no product available');
    });
  });
});
