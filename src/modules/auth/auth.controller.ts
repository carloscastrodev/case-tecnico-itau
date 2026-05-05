import { Body, Controller, Post } from '@nestjs/common';
import { SignInRequestDto } from './request/sign-in.request';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInUseCase } from './use-cases/sign-in';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly signInUseCase: SignInUseCase) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Autenticação do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso.',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      expiresAt: 1777958257000,
      type: 'Bearer',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
    example: { statusCode: 401, error: 'Unauthorized', message: 'Credenciais inválidas' },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou variável de ambiente não configurada.',
    example: {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Erro interno do servidor ou variável de ambiente não configurada.',
    },
  })
  signIn(@Body() signInDto: SignInRequestDto) {
    return this.signInUseCase.execute(signInDto);
  }
}
