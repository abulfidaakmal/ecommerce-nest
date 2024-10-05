import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('CartController (e2e)', () => {
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
    await testService.createSeller();
    await testService.createProductWithoutElastic();
  });

  afterEach(async () => {
    await testService.removeAllCart();
    await testService.removeAllProductWithoutElastic();
    await testService.removeAllSeller();
    await testService.removeAllAddress();
    await testService.removeAllCategory();
    await testService.removeAllUser();
  });

  describe('/api/carts (POST)', () => {
    it('should can create cart', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/carts')
        .send({
          product_id: productId,
          quantity: 2,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.cart.id).toBeDefined();
      expect(response.body.data.cart.quantity).toBe(2);
      expect(response.body.data.cart.total).toBe(1000 * 2);
      expect(response.body.data.product.id).toBe(productId);
      expect(response.body.data.product.name).toBe('test123');
      expect(response.body.data.product.image_url).toBe('test');
      expect(response.body.data.product.price).toBe(1000);
      expect(response.body.data.product.stock).toBe(1);
      expect(response.body.data.product.seller_name).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/carts')
        .send({
          product_id: 'wrong',
          quantity: 'wrong',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if product is not found', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/carts')
        .send({
          product_id: productId + 100,
          quantity: 2,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should can update the quantity and total if the product is already on the cart', async () => {
      await testService.createCart();
      let cart = await testService.getCart();
      const productId = await testService.getProductId();

      expect(cart.quantity).toBe(1);
      expect(cart.total).toBe(1000);

      const response = await request(app.getHttpServer())
        .post('/api/carts')
        .send({
          product_id: productId,
          quantity: 2,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.cart.id).toBeDefined();
      expect(response.body.data.cart.quantity).toBe(3);
      expect(response.body.data.cart.total).toBe(1000 * 3);
      expect(response.body.data.product.id).toBe(productId);
      expect(response.body.data.product.name).toBe('test123');
      expect(response.body.data.product.image_url).toBe('test');
      expect(response.body.data.product.price).toBe(1000);
      expect(response.body.data.product.stock).toBe(1);
      expect(response.body.data.product.seller_name).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();

      cart = await testService.getCart();
      expect(cart.quantity).toBe(3);
      expect(cart.total).toBe(3000);
    });
  });

  describe('/api/carts (GET)', () => {
    it('should can get all cart', async () => {
      await testService.createCart();

      const response = await request(app.getHttpServer())
        .get('/api/carts')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].cart.id).toBeDefined();
      expect(response.body.data[0].cart.quantity).toBe(1);
      expect(response.body.data[0].cart.total).toBe(1000);
      expect(response.body.data[0].product.id).toBeDefined();
      expect(response.body.data[0].product.name).toBe('test123');
      expect(response.body.data[0].product.image_url).toBe('test');
      expect(response.body.data[0].product.price).toBe(1000);
      expect(response.body.data[0].product.stock).toBe(1);
      expect(response.body.data[0].product.seller_name).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should can get all cart if the query does not exists', async () => {
      await testService.createCart();

      const response = await request(app.getHttpServer())
        .get('/api/carts')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data[0].cart.id).toBeDefined();
      expect(response.body.data[0].cart.quantity).toBe(1);
      expect(response.body.data[0].cart.total).toBe(1000);
      expect(response.body.data[0].product.id).toBeDefined();
      expect(response.body.data[0].product.name).toBe('test123');
      expect(response.body.data[0].product.image_url).toBe('test');
      expect(response.body.data[0].product.price).toBe(1000);
      expect(response.body.data[0].product.stock).toBe(1);
      expect(response.body.data[0].product.seller_name).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/carts')
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

    it('should reject if no cart available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/carts')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no cart available');
    });
  });
});
