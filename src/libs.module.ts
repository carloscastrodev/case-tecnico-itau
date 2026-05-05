import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { isProduction } from '@/utils/environment';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport: isProduction() ? undefined : { target: 'pino-pretty' },
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class LibsModule { }
