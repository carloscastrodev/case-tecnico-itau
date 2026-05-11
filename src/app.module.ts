import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { MessagesModule } from '@/modules/messages/messages.module';
import { LibsModule } from '@/libs.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/config/validate';
import { GuardsModule } from './guards/guards.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    GuardsModule,
    LibsModule,
    AuthModule,
    MessagesModule,
    RateLimitModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
