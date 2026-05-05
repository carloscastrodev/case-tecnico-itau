import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { isProduction } from '@/utils/environment';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/validate';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport: isProduction() ? undefined : { target: 'pino-pretty' },
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
  ],
  controllers: [],
  providers: [],
})
export class LibsModule {}
