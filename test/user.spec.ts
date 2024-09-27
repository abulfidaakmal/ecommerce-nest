import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    testService = app.get(TestService);

    await app.init();
  });

  describe('/api/users (POST)', () => {
    afterEach(async () => {
      await testService.removeAllUser();
    });

    it('should can register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .field({
          username: 'test',
          first_name: 'test',
          last_name: 'test',
          phone: '09201910',
          email: 'test@gmail.com',
          password: 'test',
          birth_of_date: '2006-06-09T00:00:00.000Z',
          gender: 'MALE',
        })
        .attach('avatar', 'test/test.png');

      expect(response.status).toBe(201);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.first_name).toBe('test');
      expect(response.body.data.last_name).toBe('test');
      expect(response.body.data.phone).toBe('09201910');
      expect(response.body.data.email).toBe('test@gmail.com');
      expect(response.body.data.birth_of_date).toBe('2006-06-09T00:00:00.000Z');
      expect(response.body.data.gender).toBe('MALE');
      expect(response.body.data.avatar).toBeDefined();
      expect(response.body.data.role).toBe('USER');
      expect(response.body.data.has_been_seller).toBe(false);
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should reject if request is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .field({
          username: '',
          first_name: '',
          last_name: '',
          phone: '',
          email: 'test',
          password: '',
          birth_of_date: '',
          gender: '',
          avatar: '',
        });

      console.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if username already exists', async () => {
      await testService.createUser();

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .field({
          username: 'test',
          first_name: 'test',
          last_name: 'test',
          phone: '09201910',
          email: 'test@gmail.com',
          password: 'test',
          birth_of_date: '2006-06-09T00:00:00.000Z',
          gender: 'MALE',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('username already exists');
    });

    it('should reject if email already exists', async () => {
      await testService.createUser();

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .field({
          username: 'test1',
          first_name: 'test',
          last_name: 'test',
          phone: '09201910',
          email: 'test@gmail.com',
          password: 'test',
          birth_of_date: '2006-06-09T00:00:00.000Z',
          gender: 'MALE',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('email already exists');
    });

    it('should reject if phone already exists', async () => {
      await testService.createUser();

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .field({
          username: 'test1',
          first_name: 'test',
          last_name: 'test',
          phone: '092019101',
          email: 'test1@gmail.com',
          password: 'test',
          birth_of_date: '2006-06-09T00:00:00.000Z',
          gender: 'MALE',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('phone already exists');
    });
  });
});
