import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostSignInDocs } from './docs/auth.controller.docs';
import { SignInRequestDto } from './request/sign-in.request';
import { SignInUseCase } from './use-cases/sign-in';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly signInUseCase: SignInUseCase) {}

  @Post('sign-in')
  @PostSignInDocs()
  signIn(@Body() signInDto: SignInRequestDto) {
    return this.signInUseCase.execute(signInDto);
  }
}
