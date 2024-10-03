import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('ProductController (e2e)', () => {
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
    await testService.createCategory();
    await testService.updateUserToSellerRole();
  });

  afterEach(async () => {
    await testService.removeAllProduct();
    await testService.removeAllCategory();
    await testService.removeAllUser();
  });

  describe('/api/products (POST)', () => {
    it('should can create product', async () => {
      const categoryId = await testService.getCategoryId();

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .field({
          name: 'test123',
          description: 'this is an example of a field description',
          price: 1000,
          stock: 1,
          category_id: categoryId,
          weight: 1000,
          condition: 'NEW',
        })
        .attach('image', 'test/test.png')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      const getProductFromElastic: any =
        await testService.getProductFromElastic();

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(getProductFromElastic.name);
      expect(response.body.data.price).toBe(getProductFromElastic.price);
      expect(response.body.data.stock).toBe(1);
      expect(response.body.data.category_name).toBe('test');
      expect(response.body.data.image_url).toBe(
        getProductFromElastic.image_url,
      );
      expect(response.body.data.isDeleted).toBe(
        getProductFromElastic.isDeleted,
      );
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject is category is not found', async () => {
      const categoryId = await testService.getCategoryId();

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .field({
          name: 'test123',
          description: 'this is an example of a field description',
          price: 1000,
          stock: 1,
          category_id: categoryId + 100,
          weight: 1000,
          condition: 'NEW',
        })
        .attach('image', 'test/test.png')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('category is not found');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: '',
          description: '',
          price: 'wrong',
          stock: 'wrong',
          category_id: 'wrong',
          weight: 'wrong',
          condition: 'wrong',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if image is required', async () => {
      const categoryId = await testService.getCategoryId();

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          name: 'test123',
          description: 'this is an example of a field description',
          price: 1000,
          stock: 1,
          category_id: categoryId,
          weight: 1000,
          condition: 'NEW',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('image is required');
    });
  });
});
