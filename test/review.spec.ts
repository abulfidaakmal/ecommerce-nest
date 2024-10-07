import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('ReviewController (e2e)', () => {
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
    await testService.createAddress();
    await testService.createProductWithoutElastic();
  });

  afterEach(async () => {
    await testService.removeAllReview();
    await testService.removeAllOrder();
    await testService.removeAllProductWithoutElastic();
    await testService.removeAllAddress();
    await testService.removeAllCategory();
    await testService.removeAllUser();
  });

  describe('/api/reviews (POST)', () => {
    it('should can create review', async () => {
      await testService.createOrder();
      await testService.updateOrderStatusToDelivered();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .field({
          product_id: productId,
          rating: 5,
          summary: 'test123',
        })
        .attach('image', 'test/test.png')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.summary).toBe('test123');
      expect(response.body.data.image_url).toBeDefined();
      expect(response.body.data.product_id).toBe(productId);
      expect(response.body.data.product_name).toBe('test123');
      expect(response.body.data.product_image).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if the order has not been delivered', async () => {
      await testService.createOrder();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .send({
          product_id: productId,
          rating: 5,
          summary: 'test123',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe(
        'cannot review if the order has not been delivered',
      );
    });

    it('should reject if request is not valid', async () => {
      await testService.createOrder();
      await testService.updateOrderStatusToDelivered();

      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .send({
          product_id: 'wrong',
          rating: 'wrong',
          summary: 'test',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if product is not found', async () => {
      await testService.createOrder();
      await testService.updateOrderStatusToDelivered();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .send({
          product_id: productId + 100,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if the user has not ordered the product', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .send({
          product_id: productId,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBe('forbidden');
    });

    it('should reject if the user has already reviewed the product', async () => {
      await testService.createOrder();
      await testService.updateOrderStatusToDelivered();
      await testService.createReview();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/reviews')
        .send({
          product_id: productId,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(409);
      expect(response.body.errors).toBe(
        'you has already reviewed this product',
      );
    });
  });
});
