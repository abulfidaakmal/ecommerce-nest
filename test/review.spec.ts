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

      let orderStatus = await testService.getOrderStatus();
      expect(orderStatus).toEqual('DELIVERED');

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

      orderStatus = await testService.getOrderStatus();
      expect(orderStatus).toEqual('COMPLETED');
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

  describe('/api/reviews (GET)', () => {
    it('should can get all review', async () => {
      await testService.createReview();

      const response = await request(app.getHttpServer())
        .get('/api/reviews')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].rating).toBe(5);
      expect(response.body.data[0].summary).toBe('test');
      expect(response.body.data[0].image_url).toBeDefined();
      expect(response.body.data[0].product_id).toBeDefined();
      expect(response.body.data[0].product_name).toBe('test123');
      expect(response.body.data[0].product_image).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reviews')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 'wrong',
          size: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no reviews available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reviews')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no reviews available');
    });
  });

  describe('/api/reviews (PATCH)', () => {
    beforeEach(async () => {
      await testService.createReview();
    });

    it('should can update review', async () => {
      const reviewId = await testService.getReviewId();

      const response = await request(app.getHttpServer())
        .patch(`/api/reviews/${reviewId}`)
        .send({
          rating: 1,
          summary: 'example',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(reviewId);
      expect(response.body.data.rating).toBe(1);
      expect(response.body.data.summary).toBe('example');
      expect(response.body.data.image_url).toBeDefined();
      expect(response.body.data.product_id).toBeDefined();
      expect(response.body.data.product_name).toBe('test123');
      expect(response.body.data.product_image).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is not valid', async () => {
      const reviewId = await testService.getReviewId();

      const response = await request(app.getHttpServer())
        .patch(`/api/reviews/${reviewId}`)
        .send({
          rating: 'wrong',
          summary: '',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if review is not found', async () => {
      const reviewId = await testService.getReviewId();

      const response = await request(app.getHttpServer())
        .patch(`/api/reviews/${reviewId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('review is not found');
    });
  });

  describe('/api/reviews/:reviewId (DELETE)', () => {
    beforeEach(async () => {
      await testService.createReview();
    });

    it('should can remove review', async () => {
      const reviewId = await testService.getReviewId();

      const response = await request(app.getHttpServer())
        .delete(`/api/reviews/${reviewId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/reviews/wrong`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if review is not found', async () => {
      const reviewId = await testService.getReviewId();

      const response = await request(app.getHttpServer())
        .delete(`/api/reviews/${reviewId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('review is not found');
    });
  });
});
