import { executionContextFactory } from '@/tests/fixtures/execution-context';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedGuard } from '../authenticated.guard';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/config/validate';
import { Request } from 'express';

describe('Authenticated Guard [UNIT]', () => {
  const testSecret = 'secret';
  const testAudience = 'test-audience';
  const testIssuer = 'test-issuer';
  const testExpirationTime = '1h';

  let guard: AuthenticatedGuard;
  let jwtService: JwtService;
  let configService: ConfigService<Env>;

  beforeAll(() => {
    jwtService = new JwtService({
      secret: testSecret,
      signOptions: {
        expiresIn: testExpirationTime,
        audience: testAudience,
        issuer: testIssuer,
      },
    });

    configService = new ConfigService<Env>();

    guard = new AuthenticatedGuard(jwtService, configService);
  });

  beforeEach(() => {
    configService.set('JWT_AUDIENCE', testAudience);
    configService.set('JWT_ISSUER', testIssuer);
  });

  it('should throw unauthorized exception when no authorization header is not set', async () => {
    const mockRequestContext = executionContextFactory({ headers: {} });
    await expect(guard.canActivate(mockRequestContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw unauthorized exception when token is invalid', async () => {
    const token = jwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: `Bearer x${token}` } });
    await expect(guard.canActivate(mockRequestContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw unauthorized exception when header is malformed', async () => {
    const token = jwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: token } });
    await expect(guard.canActivate(mockRequestContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw unauthorized exception when token is expired', async () => {
    const expiredJwtService = new JwtService({
      secret: testSecret,
      signOptions: {
        expiresIn: '0s',
        audience: testAudience,
        issuer: testIssuer,
      },
    });

    const token = expiredJwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: `Bearer ${token}` } });
    await expect(guard.canActivate(mockRequestContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw unauthorized exception when audience is invalid', async () => {
    configService.set('JWT_AUDIENCE', 'another-audience');

    const token = jwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: `Bearer ${token}` } });
    await expect(guard.canActivate(mockRequestContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw unauthorized exception when issuer is invalid', async () => {
    configService.set('JWT_ISSUER', 'another-issuer');

    const token = jwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: `Bearer ${token}` } });
    await expect(guard.canActivate(mockRequestContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true when authorization header is set and token is valid', async () => {
    const token = jwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: `Bearer ${token}` } });
    await expect(guard.canActivate(mockRequestContext)).resolves.toBe(true);
  });

  it('should set the user on the request when token is valid', async () => {
    const token = jwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: `Bearer ${token}` } });
    await guard.canActivate(mockRequestContext);
    const request = mockRequestContext.switchToHttp().getRequest<Request>();
    expect(request.user).toBeDefined();
    expect(request.user?.username).toBe('user');
  });
});
