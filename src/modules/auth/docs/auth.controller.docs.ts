import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiHeaders, ApiOperation, ApiResponse, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { SignInRequestDto } from '../request/sign-in.request';

const commonHeaders: Record<
  string,
  {
    description: string;
    example: any;
  }
> = {
  'X-RateLimit-Limit': {
    description: 'Quantidade máxima de requisições permitidas',
    example: 5,
  },
  'X-RateLimit-Remaining': {
    description: 'Quantidade de requisições restantes',
    example: 4,
  },
  'X-RateLimit-Reset': {
    description: 'Tempo em segundos para esperar antes de fazer outra requisição',
    example: 60,
  },
};

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
      headers: commonHeaders,
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
      headers: commonHeaders,
      description: 'Credenciais inválidas.',
      example: { statusCode: HttpStatus.UNAUTHORIZED, error: 'Unauthorized', message: 'Credenciais inválidas' },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      headers: commonHeaders,
      description: 'Erro interno do servidor ou variável de ambiente não configurada.',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Erro interno do servidor ou variável de ambiente não configurada.',
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'Requisições acima do permitido pelo rate limiter',
      example: {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
      },
      headers: {
        'Retry-After': {
          description: 'Tempo em segundos para esperar antes de fazer outra requisição',
          example: 300,
        },
      },
    }),
  );
}
