import './lib/datadog/tracer';
import { HttpStatus, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { isDevelopment, isTesting } from './utils/environment';
import configSwagger from './lib/swagger/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configureApp(app);
  configSwagger(app);
  app.enableShutdownHooks();
  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  app.get(Logger).log(`Aplicação rodando na porta: ${port}`);
}

export async function configureApp(app: INestApplication<any>) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      enableDebugMessages: isDevelopment() || isTesting(),
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    }),
  );

  app.use(json());

  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}

// Aqui eu cometi um erro criando o configureApp e importando ele nos testes
// Isso fazia uma instância adicional do nest ser inicializada
// Corrigi isso (com ajuda do Claude) dessa forma abaixo.
// A alternativa mais correta provavelmente seria ter isolado
// o configureApp em outro arquivo, mas decidi manter isso aqui
// para discussão
if (require.main === module) {
  bootstrap();
}
