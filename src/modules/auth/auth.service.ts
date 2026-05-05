import { Injectable } from '@nestjs/common';
import { SignInRequestDto } from './request/sign-in.request';


@Injectable()
export class AuthService {
  signIn(signinDto: SignInRequestDto) {
    throw new Error('Method not implemented.');
  }
}
