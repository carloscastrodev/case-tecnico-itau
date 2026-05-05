import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/config/validate';
import { SignInUseCase } from './use-cases/sign-in';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService<Env>) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRATION_TIME'),
          audience: config.get('JWT_AUDIENCE'),
          issuer: config.get('JWT_ISSUER'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [SignInUseCase],
})
export class AuthModule {}
