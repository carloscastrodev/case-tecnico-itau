import { DecodedJwt } from '@/types/decoded-jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import z from 'zod';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/config/validate';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    try {
      const decoded = this.jwtService.verify<DecodedJwt>(token);
      this.validateDecodedTokenOrThrow(decoded);
      request.user = decoded;
    } catch (error) {
      throw new UnauthorizedException('Token de acesso inválido');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private validateDecodedTokenOrThrow(decoded: DecodedJwt): void {
    const audience = this.configService.get('JWT_AUDIENCE', { infer: true });
    const issuer = this.configService.get('JWT_ISSUER', { infer: true });

    const schema = z.object({
      username: z.string(),
      exp: z.number(),
      iat: z.number(),
      aud: z.literal(audience),
      iss: z.literal(issuer),
    });

    schema.parse(decoded);
  }
}
