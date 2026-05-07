import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SignInRequestDto } from '@/modules/auth/request/sign-in.request';
import { JwtService } from '@nestjs/jwt';
import { SignInResponseDto } from '@/modules/auth/response/sign-in.response';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/config/validate';
import { Logger } from 'nestjs-pino';
import { DecodedJwt } from '@/types/decoded-jwt';

@Injectable()
export class SignInUseCase {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService<Env>,
    private readonly logger: Logger,
  ) {}

  async execute(signinDto: SignInRequestDto): Promise<SignInResponseDto> {
    this.logger.log(`Tentativa de login para o usuário: ${signinDto.username}`);
    const { username, password } = signinDto;

    const { resolvedUsername } = this.getUserOrThrow({ username, password });

    const { accessToken, refreshToken, expiresAt } = this.generateTokens(resolvedUsername);

    this.logger.log(`Login bem sucedido para o usuário: ${resolvedUsername}`);

    return {
      accessToken,
      refreshToken,
      expiresAt,
      type: 'Bearer',
    };
  }

  private getUserOrThrow({ username, password }: { username: string; password: string }): { resolvedUsername: string } {
    // Aqui deveria chamar um serviço IdP ou buscar em um banco de dados
    // Por simplicidade, estou usando variáveis de ambiente com valores mockados.

    const mockedUserName = this.config.get('MOCKED_USER_USERNAME', { infer: true });
    const mockedUserPassword = this.config.get('MOCKED_USER_PASSWORD', { infer: true });

    if (!mockedUserName || !mockedUserPassword) {
      throw new InternalServerErrorException('Variáveis de ambiente para autenticação não configuradas');
    }

    if (username !== mockedUserName || password !== mockedUserPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return { resolvedUsername: username };
  }

  private generateTokens(username: string): { accessToken: string; refreshToken: string; expiresAt: number } {
    const accessToken = this.jwtService.sign({ username });

    // O refreshToken deveria ser um token diferente com expiração maior, mas por simplicidade, estou usando o mesmo token.
    const refreshToken = this.jwtService.sign({ username });

    const decoded: DecodedJwt = this.jwtService.decode(accessToken);
    return { accessToken, refreshToken, expiresAt: decoded.exp * 1000 };
  }
}
