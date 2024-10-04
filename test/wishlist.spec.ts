import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('WishlistController (e2e)', () => {
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
    await testService.removeAllWishlist();
    await testService.removeAllProductWithoutElastic();
    await testService.removeAllCategory();
    await testService.removeAllUser();
  });

  describe('/api/users/wishlists (POST)', () => {
    it('should can create wishlist', async () => {
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/users/wishlists')
        .send({
          product_id: productId,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.product_id).toBe(productId);
      expect(response.body.data.name).toBe('test123');
      expect(response.body.data.price).toBe(1000);
      expect(response.body.data.image_url).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/wishlists')
        .send({
          product_id: 'wrong',
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
        .post('/api/users/wishlists')
        .send({
          product_id: productId + 100,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('product is not found');
    });

    it('should reject if product already on the wishlist', async () => {
      await testService.createWishlist();
      const productId = await testService.getProductId();

      const response = await request(app.getHttpServer())
        .post('/api/users/wishlists')
        .send({
          product_id: productId,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(409);
      expect(response.body.errors).toBe('product already on the wishlist');
    });
  });

  describe('/api/users/wishlists (GET)', () => {
    it('should can get all wishlist', async () => {
      await testService.createWishlist();

      const response = await request(app.getHttpServer())
        .get('/api/users/wishlists')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].product_id).toBeDefined();
      expect(response.body.data[0].name).toBe('test123');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should can get all wishlist if the query does not exists', async () => {
      await testService.createWishlist();

      const response = await request(app.getHttpServer())
        .get('/api/users/wishlists')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].product_id).toBeDefined();
      expect(response.body.data[0].name).toBe('test123');
      expect(response.body.data[0].price).toBe(1000);
      expect(response.body.data[0].image_url).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_data).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/wishlists')
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

    it('should reject if no wishlist available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/wishlists')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no wishlist available');
    });
  });

  describe('/api/users/wishlists/:wishlistId (DELETE)', () => {
    beforeEach(async () => {
      await testService.createWishlist();
    });

    it('should can remove wishlist', async () => {
      const wishlistId = await testService.getWishlistId();

      const response = await request(app.getHttpServer())
        .delete(`/api/users/wishlists/${wishlistId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');
    });

    it('should reject if wishlist is not found', async () => {
      const wishlistId = await testService.getWishlistId();

      const response = await request(app.getHttpServer())
        .delete(`/api/users/wishlists/${wishlistId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('wishlist is not found');
    });
  });
});
