import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { configureApp } from '@/main';

describe('Auth [E2E]', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  describe('POST /v1/auth/sign-in', () => {
    it('should return 200 with correct response format when credentials are valid', async () => {
      const response = await request(app.getHttpServer()).post('/v1/auth/sign-in').send({
        username: process.env.MOCKED_USER_USERNAME,
        password: process.env.MOCKED_USER_PASSWORD,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('type');
    });

    it('should return 400 with a message when body is missing', async () => {
      const response = await request(app.getHttpServer()).post('/v1/auth/sign-in').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with a message when username is invalid', async () => {
      const response = await request(app.getHttpServer()).post('/v1/auth/sign-in').send({
        username: 'wrong-username',
        password: process.env.MOCKED_USER_PASSWORD,
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with a message when password is invalid', async () => {
      const response = await request(app.getHttpServer()).post('/v1/auth/sign-in').send({
        username: process.env.MOCKED_USER_USERNAME,
        password: 'wrong-password',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
