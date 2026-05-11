import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { isProduction, isTesting } from '@/utils/environment';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/validate';
import { DynamooseModelsModule } from './lib/dynamoose/dynamoose.models.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport: isProduction() ? undefined : { target: 'pino-pretty' },
        level: isTesting() ? 'silent' : 'info', // Caso queira ver os logs da aplicação durante os testes, modifique essa linha
        // Provavelmente isso deveria ser uma variável de ambiente própria
      },
    }),
    DynamooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Env>) => ({
        aws: {
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          region: configService.get('AWS_REGION'),
        },
        local: configService.get('DYNAMODB_ENDPOINT'),
      }),
    }),
    DynamooseModelsModule,
  ],
  controllers: [],
  providers: [],
})
export class LibsModule {}
