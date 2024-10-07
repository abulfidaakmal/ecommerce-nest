import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('OrderController (e2e)', () => {
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
    await testService.createProductWithoutElastic();
  });

  afterEach(async () => {
    await testService.removeAllOrder();
    await testService.removeAllProductWithoutElastic();
    await testService.removeAllCategory();
    await testService.removeAllSeller();
    await testService.removeAllAddress();
    await testService.removeAllUser();
  });

  describe('/api/orders (POST)', () => {
    it('should can create order', async () => {
      await testService.createAddressAndSelect();
      await testService.createSeller();

      const productId = await testService.getProductId();
      let getProductStock = await testService.getProductStock();

      expect(getProductStock).toBe(1);

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send([
          {
            product_id: productId,
            quantity: 1,
          },
        ])
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.order.id).toBeDefined();
      expect(response.body.data.order.total_price).toBe(1000);
      expect(response.body.data.order.total_quantity).toBe(1);
      expect(response.body.data.product[0].id).toBe(productId);
      expect(response.body.data.product[0].name).toBe('test123');
      expect(response.body.data.product[0].price).toBe(1000);
      expect(response.body.data.product[0].quantity).toBe(1);
      expect(response.body.data.product[0].status).toBe('PENDING');
      expect(response.body.data.product[0].seller_name).toBe('test');
      expect(response.body.data.product[0].image_url).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();

      getProductStock = await testService.getProductStock();
    });

    it('should reject if request is not valid', async () => {
      await testService.createAddressAndSelect();
      await testService.createSeller();

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send([
          {
            product_id: 'wrong',
            quantity: 'wrong',
          },
        ])
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if product is not found', async () => {
      await testService.createAddressAndSelect();
      await testService.createSeller();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send([
          {
            product_id: productId + 100,
            quantity: 1,
          },
        ])
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('one or more products were not found');
    });

    it('should reject if the product has insufficient stock', async () => {
      await testService.createAddressAndSelect();
      await testService.createSeller();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send([
          {
            product_id: productId,
            quantity: 2,
          },
        ])
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe(
        'product test123 has insufficient stock',
      );
    });

    it('should reject if address is not add', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send([
          {
            product_id: productId,
            quantity: 1,
          },
        ])
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe(
        'please add your address before placing an order',
      );
    });
  });

  describe('/api/orders (GET)', () => {
    beforeEach(async () => {
      await testService.createAddressAndSelect();
      await testService.createSeller();
      await testService.createManyOrder();
    });

    it('should can get all order', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].order.id).toBeDefined();
      expect(response.body.data[0].order.total_price).toBe(3000);
      expect(response.body.data[0].order.total_quantity).toBe(3);
      expect(response.body.data[0].product[0].id).toBeDefined();
      expect(response.body.data[0].product[0].name).toBe('test123');
      expect(response.body.data[0].product[0].price).toBe(1000);
      expect(response.body.data[0].product[0].quantity).toBe(1);
      expect(response.body.data[0].product[0].status).toBe('PENDING');
      expect(response.body.data[0].product[0].seller_name).toBe('test');
      expect(response.body.data[0].product[0].image_url).toBe('test');
      expect(response.body.data[0].product[1].id).toBeDefined();
      expect(response.body.data[0].product[1].name).toBe('test123');
      expect(response.body.data[0].product[1].price).toBe(1000);
      expect(response.body.data[0].product[1].quantity).toBe(2);
      expect(response.body.data[0].product[1].status).toBe('PENDING');
      expect(response.body.data[0].product[1].seller_name).toBe('test');
      expect(response.body.data[0].product[1].image_url).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 'wrong',
          size: 'wrong',
          status: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if no order available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          status: 'CANCELLED',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no order available');
    });
  });

  describe('/api/orders/:orderId/products/:productId (GET)', () => {
    beforeEach(async () => {
      await testService.createAddressAndSelect();
      await testService.createSeller();
      await testService.createOrder();
    });

    it('should can get order detail', async () => {
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}/products/${productId}`)
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
      expect(response.body.data.product.seller.name).toBe('test');
      expect(response.body.data.product.seller.city).toBe('test');
      expect(response.body.data.product.seller.province).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if order is not found', async () => {
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/orders/${orderId + 100}/products/${productId}`)
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
        .get(`/api/orders/${orderId}/products/${productId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/orders/wrong/products/wrong`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('/api/orders/:orderId/products/:productId (PATCH)', () => {
    beforeEach(async () => {
      await testService.createAddressAndSelect();
      await testService.createSeller();
      await testService.createOrder();
    });

    it('should can cancel product', async () => {
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      let stock = await testService.getProductStock();
      expect(stock).toBe(1);

      let status = await testService.getOrderStatus();
      expect(status).toBe('PENDING');

      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${orderId}/products/${productId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');

      stock = await testService.getProductStock();
      expect(stock).toBe(3);

      status = await testService.getOrderStatus();
      expect(status).toBe('CANCELLED');
    });

    it('should reject if order is not found', async () => {
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${orderId + 100}/products/${productId}`)
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
        .patch(`/api/orders/${orderId}/products/${productId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/orders/wrong/products/wrong`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if the order status is not PENDING or CONFIRMED', async () => {
      await testService.updateOrderStatusToDelivered();
      const orderId = await testService.getOrderId();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${orderId}/products/${productId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('product cannot be cancelled');
    });
  });
});
