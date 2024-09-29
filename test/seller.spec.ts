import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('SellerController (e2e)', () => {
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
    await testService.createAddress();
  });

  afterEach(async () => {
    await testService.removeAllSeller();
    await testService.removeAllAddress();
    await testService.removeAllUser();
  });

  describe('/api/sellers (POST)', () => {
    it('should can register seller', async () => {
      const addressId = await testService.getAddressId();
      let getUserRole = await testService.getUserRole();

      expect(getUserRole.role).toBe('USER');
      expect(getUserRole.has_been_seller).toBeFalsy();

      const response = await request(app.getHttpServer())
        .post('/api/sellers')
        .send({
          name: 'test',
          description: 'test123456',
          address_id: addressId,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.description).toBe('test123456');
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();

      getUserRole = await testService.getUserRole();
      expect(getUserRole.role).toBe('SELLER');
      expect(getUserRole.has_been_seller).toBeTruthy();
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sellers')
        .send({
          email: '',
          password: '',
          address_id: 'salah',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if user has been registered', async () => {
      await testService.createSeller();
      await testService.updateUserToSellerRole();

      const response = await request(app.getHttpServer())
        .post('/api/sellers')
        .send({
          name: 'test',
          description: 'test123456',
          address_id: 10,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(409);
      expect(response.body.errors).toBe('user is already a registered seller');
    });

    it('should reject if name already exists', async () => {
      const addressId = await testService.getAddressId();
      await testService.createSeller();

      const response = await request(app.getHttpServer())
        .post('/api/sellers')
        .send({
          name: 'test',
          description: 'test123456',
          address_id: addressId,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('name already exists');
    });

    it('should reject if address is not found', async () => {
      const addressId = await testService.getAddressId();

      const response = await request(app.getHttpServer())
        .post('/api/sellers')
        .send({
          name: 'test',
          description: 'test123456',
          address_id: addressId + 100,
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('address is not found');
    });
  });
});
