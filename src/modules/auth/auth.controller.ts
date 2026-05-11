import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostSignInDocs } from './docs/auth.controller.docs';
import { SignInRequestDto } from './request/sign-in.request';
import { SignInUseCase } from './use-cases/sign-in';
import { ThrottleBodyField } from '@/decorators/throttle-body-field.decorator';
import { BodyThrottleGuard } from '@/guards/body-throttle.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly signInUseCase: SignInUseCase) {}

  @Post('sign-in')
  @PostSignInDocs()
  @Throttle({ default: { limit: 5, ttl: 60_000, blockDuration: 300_000 } })
  @ThrottleBodyField('username')
  @UseGuards(BodyThrottleGuard)
  signIn(@Body() signInDto: SignInRequestDto) {
    return this.signInUseCase.execute(signInDto);
  }
}
