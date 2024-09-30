import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('CategoryController (e2e)', () => {
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
  });

  afterEach(async () => {
    await testService.removeAllCategory();
    await testService.removeAllUser();
  });

  describe('/api/categories (POST)', () => {
    it('should can create category', async () => {
      await testService.updateUserToAdminRole();

      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: 'test',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is not valid', async () => {
      await testService.updateUserToAdminRole();

      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: '',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if name already exists', async () => {
      await testService.updateUserToAdminRole();
      await testService.createCategory();

      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({
          name: 'test',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('name already exists');
    });

    it('should reject if the role is not ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .send({
          name: 'name',
        });

      expect(response.status).toBe(403);
      expect(response.body.errors).toBe('forbidden');
    });
  });

  describe('/api/categories (GET)', () => {
    it('should can get all category', async () => {
      await testService.createCategory();
      await testService.createCategory();
      await testService.updateUserToAdminRole();

      const response = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ])
        .query({
          page: 1,
          size: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].name).toBe('test');
      expect(response.body.data[0].username).toBe('test');
      expect(response.body.data[0].created_at).toBeDefined();
      expect(response.body.data[0].updated_at).toBeDefined();
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.total_data).toBe(2);
      expect(response.body.paging.total_page).toBe(2);
    });

    it('should reject if request is not valid', async () => {
      await testService.updateUserToAdminRole();

      const response = await request(app.getHttpServer())
        .get('/api/categories')
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

    it('should reject if no category available', async () => {
      await testService.updateUserToAdminRole();

      const response = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('no category available');
    });

    it('should reject if the role is not ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBe('forbidden');
    });
  });

  describe('/api/categories/:categoryId (PATCH)', () => {
    beforeEach(async () => {
      await testService.createCategory();
    });

    it('should can update category', async () => {
      await testService.updateUserToAdminRole();
      const categoryId = await testService.getCategoryId();

      const response = await request(app.getHttpServer())
        .patch(`/api/categories/${categoryId}`)
        .send({
          name: 'example',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('example');
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is not valid', async () => {
      await testService.updateUserToAdminRole();
      const categoryId = await testService.getCategoryId();

      const response = await request(app.getHttpServer())
        .patch(`/api/categories/${categoryId}`)
        .send({
          name: '',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if category is not found', async () => {
      await testService.updateUserToAdminRole();
      const categoryId = await testService.getCategoryId();

      const response = await request(app.getHttpServer())
        .patch(`/api/categories/${categoryId + 100}`)
        .send({
          name: 'example',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('category is not found');
    });

    it('should reject if the role is not ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/categories/1')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(403);
      expect(response.body.errors).toBe('forbidden');
    });
  });
});
