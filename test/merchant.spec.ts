import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('MerchantController (e2e)', () => {
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
  });

  afterEach(async () => {
    await testService.removeAllProductWithoutElastic();
    await testService.removeAllCategory();
    await testService.removeAllSeller();
    await testService.removeAllAddress();
    await testService.removeAllUser();
  });

  describe('/api/merchants/:merchantName (GET)', () => {
    it('should can get merchant info', async () => {
      await testService.createProductWithoutElastic();

      const response = await request(app.getHttpServer()).get(
        '/api/merchants/test',
      );

      expect(response.status).toBe(200);
      expect(response.body.data.seller.name).toBe('test');
      expect(response.body.data.seller.description).toBe('test');
      expect(response.body.data.seller.avatar).toBe('test');
      expect(response.body.data.seller.created_at).toBeDefined();
      expect(response.body.data.address.city).toBe('test');
      expect(response.body.data.address.province).toBe('test');
      expect(response.body.data.rating.percentage).toBe('0%');
      expect(response.body.data.rating.total).toBe(0);
      expect(response.body.data.product.total).toBe(1);
      expect(response.body.data.product.complete).toBe(0);
    });

    it('should reject if merchant is not found', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/merchants/not found',
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('merchant is not found');
    });
  });

  describe('/api/merchants/:merchantName/products (GET)', () => {
    it('should can get product merchant', async () => {
      await testService.createProductWithoutElastic();

      const response = await request(app.getHttpServer())
        .get('/api/merchants/test/products')
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

    it('should can get product merchant if the query does not exists', async () => {
      await testService.createProductWithoutElastic();

      const response = await request(app.getHttpServer()).get(
        '/api/merchants/test/products',
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
        .get('/api/merchants/test/products')
        .query({
          page: 'wrong',
          size: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no product available', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/merchants/test/products',
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no product available');
    });

    it('should reject if merchant is not found', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/merchants/not found/products',
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('merchant is not found');
    });
  });
});
