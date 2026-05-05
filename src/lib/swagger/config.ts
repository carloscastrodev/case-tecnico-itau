import { Config } from '@/config/config';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const FALLBACK_SWAGGER_CONFIG = {
  title: 'Case Técnico Itaú - API de Mensagens',
  description: 'API REST de mensagens com autenticação JWT',
  version: '1.0',
  tag: 'Rotas da API',
  url: '/api/docs',
};

export default function configSwagger(app: INestApplication<any>) {
  const envConfig = app.get(ConfigService<Config>);
  const config = new DocumentBuilder()
    .setTitle(envConfig.get('SWAGGER_TITLE', FALLBACK_SWAGGER_CONFIG.title))
    .setDescription(envConfig.get('SWAGGER_DESCRIPTION', FALLBACK_SWAGGER_CONFIG.description))
    .setVersion(envConfig.get('SWAGGER_VERSION', FALLBACK_SWAGGER_CONFIG.version))
    .addTag(envConfig.get('SWAGGER_TAG', FALLBACK_SWAGGER_CONFIG.tag))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'Autenticação JWT',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(envConfig.get('SWAGGER_URL', FALLBACK_SWAGGER_CONFIG.url), app, documentFactory);
}
