import { executionContextFactory } from '@/tests/fixtures/execution-context';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedGuard } from '../authenticated.guard';

describe('Authenticated Guard [UNIT]', () => {
  const testSecret = 'secret';
  const testAudience = 'test-audience';
  const testIssuer = 'test-issuer';
  const testExpirationTime = '1h';

  let guard: AuthenticatedGuard;
  let jwtService: JwtService;

  beforeAll(() => {
    jwtService = new JwtService({
      secret: testSecret,
      signOptions: {
        expiresIn: testExpirationTime,
        audience: testAudience,
        issuer: testIssuer,
      },
    });

    guard = new AuthenticatedGuard(jwtService);
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

  it('should return true when authorization header is set and token is valid', async () => {
    const token = jwtService.sign({ username: 'user' });
    const mockRequestContext = executionContextFactory({ headers: { authorization: `Bearer ${token}` } });
    await expect(guard.canActivate(mockRequestContext)).resolves.toBe(true);
  });
});
