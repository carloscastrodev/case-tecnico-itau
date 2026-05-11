import { AppModule } from '@/app.module';
import { configureApp } from '@/main';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GenericContainer } from 'testcontainers';

export async function e2eSetup() {
  const container = await new GenericContainer('amazon/dynamodb-local').withExposedPorts(8000).start();

  const containerEndpoint = `http://${container.getHost()}:${container.getMappedPort(8000)}`;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue({
      get: (key: string) => {
        if (key === 'DYNAMODB_ENDPOINT') return containerEndpoint;
        return process.env[key];
      },
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();

  return {
    app,
    container,
  };
}
