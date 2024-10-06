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

  describe('/api/products (GET)', () => {
    beforeEach(async () => {
      await testService.createProductWithoutElastic();
    });

    it('should can search product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          search: 'test',
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBe('test123');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.data[0].stock).toBe(1);
      expect(response.body.data[0].category_name).toBe('test');
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].isDeleted).toBeFalsy();
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should can search product if the query does not exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBe('test123');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.data[0].stock).toBe(1);
      expect(response.body.data[0].category_name).toBe('test');
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].isDeleted).toBeFalsy();
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if product is not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          search: 'not found',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          search: '',
          page: 'wrong',
          size: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('/api/products/:productId (GET)', () => {
    beforeEach(async () => {
      await testService.createProductWithoutElastic();
    });

    it('should can get product by id', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      console.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe('test123');
      expect(response.body.data.description).toBe(
        'this is an example of a field description',
      );
      expect(response.body.data.image_url).toBe('test');
      expect(response.body.data.price).toBe(1000);
      expect(response.body.data.stock).toBe(1);
      expect(response.body.data.weight).toBe(1000);
      expect(response.body.data.condition).toBe('NEW');
      expect(response.body.data.category_name).toBe('test');
      expect(response.body.data.sku).toBe('test');
      expect(response.body.data.isDeleted).toBeFalsy();
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if product is not found', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .get(`/api/products/${productId + 100}`)

        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });
  });

  describe('/api/products/:productId (PATCH)', () => {
    beforeEach(async () => {
      await testService.createProduct();
    });

    it('should can update product', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send({
          name: 'example',
          price: 2000,
          stock: 2,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe('example');
      expect(response.body.data.image_url).toBe('test');
      expect(response.body.data.price).toBe(1000 * 2);
      expect(response.body.data.stock).toBe(1 * 2);
      expect(response.body.data.category_name).toBe('test');
      expect(response.body.data.isDeleted).toBeFalsy();
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();

      const getProductFromElastic: any =
        await testService.getProductFromElastic();

      expect(getProductFromElastic.name).toBe('example');
      expect(getProductFromElastic.price).toBe(1000 * 2);
    });

    it('should can update product image', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .attach('image', 'test/test.png')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.image_url).not.toBe('test');
      expect(response.body.data.price).toBe(1000);
      expect(response.body.data.stock).toBe(1);
      expect(response.body.data.category_name).toBe('test');
      expect(response.body.data.isDeleted).toBeFalsy();
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();

      const getProductFromElastic: any =
        await testService.getProductFromElastic();

      expect(getProductFromElastic.image_url).not.toBe('test');
    });

    it('should reject if product is not found', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productId + 100}`)
        .send({
          name: 'example',
          price: 2000,
          stock: 2,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if category is not found', async () => {
      const productId = await testService.getProductId();
      const categoryId = await testService.getCategoryId();

      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send({
          name: 'example',
          price: 2000,
          stock: 2,
          weight: 2000,
          condition: 'USED',
          category_id: categoryId + 100,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('category is not found');
    });

    it('should reject if request is not valid', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .patch(`/api/products/${productId}`)
        .send({
          name: '',
          price: 'wrong',
          stock: 'wrong',
          weight: 'wrong',
          condition: 'wrong',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('/api/products/:productId (DELETE)', () => {
    beforeEach(async () => {
      await testService.createProduct();
    });

    it('should can remove product', async () => {
      const productId = await testService.getProductId();

      let checkProductStatus = await testService.checkProductStatus();
      expect(checkProductStatus).toBeFalsy();

      let getProductFromElastic: any =
        await testService.getProductFromElastic();
      expect(getProductFromElastic.isDeleted).toBeFalsy();

      const response = await request(app.getHttpServer())
        .delete(`/api/products/${productId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');

      checkProductStatus = await testService.checkProductStatus();
      expect(checkProductStatus).toBeTruthy();

      getProductFromElastic = await testService.getProductFromElastic();
      expect(getProductFromElastic.isDeleted).toBeTruthy();
    });

    it('should reject if product is not found', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .delete(`/api/products/${productId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });
  });
});
