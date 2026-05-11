import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { configureApp } from '@/main';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { ConfigService } from '@nestjs/config';
import { e2eSetup } from '@/tests/fixtures/e2e-setup';

describe('Auth [E2E]', () => {
  let app: INestApplication;
  let container: StartedTestContainer;

  beforeAll(async () => {
    ({ app, container } = await e2eSetup());
  });

  afterAll(async () => {
    await app?.close();
    await container?.stop();
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

    it('should return 429 with a message and correct headers when making more than 5 requests in 1 minute', async () => {
      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer()).post('/v1/auth/sign-in').send({
          username: 'some-username',
          password: 'some-password',
        });

        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
          expect(response.body).toHaveProperty('message');
          expect(response.headers).toHaveProperty('retry-after');
          expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
        }
      }
    });

    it('should not rate limit different usernames when making more than 5 requests in 1 minute', async () => {
      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer()).post('/v1/auth/sign-in').send({
          username: i.toString(),
          password: 'some-password',
        });

        expect(response.status).toBe(401);
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
