import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { Logger } from 'nestjs-pino';
import { VersioningType } from '@nestjs/common';
import configSwagger from './lib/swagger/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  configSwagger(app);

  app.use(json());

  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  app.get(Logger).log(`Application is running on port ${port}`);
}
bootstrap();
