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
      expect(response.body.data.product.total_rating).toBe(0);
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
});
