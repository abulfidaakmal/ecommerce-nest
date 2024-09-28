import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import * as cookieParser from 'cookie-parser';

describe('AddressController (e2e)', () => {
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
    await testService.removeAllAddress();
    await testService.removeAllUser();
  });

  describe('/api/addresses (POST)', () => {
    it('should can create address', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/addresses')
        .send({
          street: 'test',
          city: 'test',
          province: 'test',
          postal_code: 'test',
          detail: 'test',
          name: 'test',
          phone: 'test',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('test');
      expect(response.body.data.city).toBe('test');
      expect(response.body.data.province).toBe('test');
      expect(response.body.data.postal_code).toBe('test');
      expect(response.body.data.detail).toBe('test');
      expect(response.body.data.is_selected).toBeTruthy();
      expect(response.body.data.is_sellers).toBeFalsy();
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.phone).toBe('test');
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/addresses')
        .send({
          street: '',
          city: '',
          province: '',
          postal_code: '',
          detail: '',
          name: '',
          phone: '',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('/api/addresses/:addressId (PUT)', () => {
    beforeEach(async () => {
      await testService.createAddress();
    });

    it('should can update address', async () => {
      const addressId = await testService.getAddressId();

      const response = await request(app.getHttpServer())
        .put(`/api/addresses/${addressId}`)
        .send({
          street: 'street',
          city: 'city',
          province: 'province',
          postal_code: '101010',
          detail: 'detail',
          name: 'budi',
          phone: '098765432',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('street');
      expect(response.body.data.city).toBe('city');
      expect(response.body.data.province).toBe('province');
      expect(response.body.data.postal_code).toBe('101010');
      expect(response.body.data.detail).toBe('detail');
      expect(response.body.data.is_selected).toBeDefined();
      expect(response.body.data.is_sellers).toBeFalsy();
      expect(response.body.data.name).toBe('budi');
      expect(response.body.data.phone).toBe('098765432');
    });

    it('should reject if request is not valid', async () => {
      const addressId = await testService.getAddressId();

      const response = await request(app.getHttpServer())
        .put(`/api/addresses/${addressId}`)
        .send({
          street: '',
          city: '',
          province: '',
          postal_code: '',
          detail: '',
          name: '',
          phone: '',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if address is not found', async () => {
      const addressId = await testService.getAddressId();

      const response = await request(app.getHttpServer())
        .put(`/api/addresses/${addressId + 100}`)
        .send({
          street: 'street',
          city: 'city',
          province: 'province',
          postal_code: '101010',
          detail: 'detail',
          name: 'budi',
          phone: '098765432',
        })
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('address is not found');
    });
  });

  describe('/api/addresses/:addressId (DELETE)', () => {
    beforeEach(async () => {
      await testService.createAddress();
      await testService.createAddress();
    });

    it('should can remove address', async () => {
      const addressId = await testService.getAddressId();
      await testService.selectAddress(addressId);
      const addressSelected = await testService.getAddressSelected();

      expect(addressSelected).toBe(addressId);

      const response = await request(app.getHttpServer())
        .delete(`/api/addresses/${addressId}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');

      expect(await testService.getAddressSelected()).toBe(addressId + 1);
    });

    it('should reject if address is not found', async () => {
      const addressId = await testService.getAddressId();

      const response = await request(app.getHttpServer())
        .delete(`/api/addresses/${addressId + 100}`)
        .set('Cookie', [
          'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE3Mjc0OTk1NTV9.zfiAoVRw5xWs96mVc7s-0Gra_wnKf31ZpeBZORJwLEs',
        ]);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('address is not found');
    });
  });
});
