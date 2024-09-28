import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
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
    await testService.removeAllUser();
  });

  describe('/api/login (POST)', () => {
    it('should can login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          email: 'test@gmail.com',
          password: 'test',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toBe('OK');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          email: '',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if email is wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          email: 'test10@gmail.com',
          password: 'test',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('email or password is wrong');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should reject if password is wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          email: 'test@gmail.com',
          password: 'test10',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('email or password is wrong');
      expect(response.headers['set-cookie']).toBeUndefined();
    });
  });

  describe('/api/logout (DELETE)', () => {
    it('should can logout', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/logout')
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');
      expect(response.get('Set-Cookie')).toBeDefined();
    });

    it('should reject if cookie is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/current')
        .set('Cookie', ['access_token=salah']);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('unauthorized');
    });
  });
});
