import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignInRequestDto } from '../request/sign-in.request';

export function PostSignInDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Autenticação do usuário' }),
    ApiBody({
      type: SignInRequestDto,
      examples: {
        'Credenciais do usuário': {
          value: {
            username: 'user',
            password: 'password',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Usuário autenticado com sucesso.',
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        expiresAt: 1777958257000,
        type: 'Bearer',
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Credenciais inválidas.',
      example: { statusCode: HttpStatus.UNAUTHORIZED, error: 'Unauthorized', message: 'Credenciais inválidas' },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno do servidor ou variável de ambiente não configurada.',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Erro interno do servidor ou variável de ambiente não configurada.',
      },
    }),
  );
}
