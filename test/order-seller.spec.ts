import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('OrderSellerController (e2e)', () => {
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
    await testService.updateUserToSellerRole();
    await testService.createAddress();
    await testService.createCategory();
    await testService.createProductWithoutElastic();
  });

  afterEach(async () => {
    await testService.removeAllOrder();
    await testService.removeAllProductWithoutElastic();
    await testService.removeAllCategory();
    await testService.removeAllAddress();
    await testService.removeAllUser();
  });

  describe('/api/seller/orders (POST)', () => {
    it('should can search order', async () => {
      await testService.createOrder();

      const response = await request(app.getHttpServer())
        .get('/api/seller/orders')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 1,
          size: 1,
          search: 'test',
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].order.id).toBeDefined();
      expect(response.body.data[0].order.customer).toBe('test');
      expect(response.body.data[0].order.price).toBe(1000);
      expect(response.body.data[0].order.quantity).toBe(2);
      expect(response.body.data[0].order.status).toBe('PENDING');
      expect(response.body.data[0].product.id).toBeDefined();
      expect(response.body.data[0].product.name).toBe('test123');
      expect(response.body.data[0].product.image_url).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should can search order if the query does not exists', async () => {
      await testService.createOrder();

      const response = await request(app.getHttpServer())
        .get('/api/seller/orders')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data[0].order.id).toBeDefined();
      expect(response.body.data[0].order.customer).toBe('test');
      expect(response.body.data[0].order.price).toBe(1000);
      expect(response.body.data[0].order.quantity).toBe(2);
      expect(response.body.data[0].order.status).toBe('PENDING');
      expect(response.body.data[0].product.id).toBeDefined();
      expect(response.body.data[0].product.name).toBe('test123');
      expect(response.body.data[0].product.image_url).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/seller/orders')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 'wrong',
          size: 'wrong',
          search: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no order available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/seller/orders')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no order available');
    });
  });

  describe('/api/seller/orders/:orderId/products/:productId (GET)', () => {
    beforeEach(async () => {
      await testService.createOrder();
    });

    it('should can get order detail', async () => {
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/seller/orders/${orderId}/products/${productId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data.order.id).toBe(orderId);
      expect(response.body.data.order.price).toBe(1000);
      expect(response.body.data.order.quantity).toBe(2);
      expect(response.body.data.order.total).toBe(1000 * 2);
      expect(response.body.data.order.status).toBe('PENDING');
      expect(response.body.data.order.address.id).toBeDefined();
      expect(response.body.data.order.address.street).toBe('test');
      expect(response.body.data.order.address.city).toBe('test');
      expect(response.body.data.order.address.province).toBe('test');
      expect(response.body.data.order.address.postal_code).toBe('test');
      expect(response.body.data.order.address.name).toBe('test');
      expect(response.body.data.order.address.phone).toBe('test');
      expect(response.body.data.product.id).toBe(productId);
      expect(response.body.data.product.name).toBe('test123');
      expect(response.body.data.product.image_url).toBe('test');
      expect(response.body.data.product.weight).toBe(1000);
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if order is not found', async () => {
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/seller/orders/${orderId + 100}/products/${productId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('order is not found');
    });

    it('should reject if product is not found', async () => {
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/seller/orders/${orderId}/products/${productId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/seller/orders/wrong/products/wrong`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
