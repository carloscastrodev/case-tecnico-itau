import { executionContextFactory } from '@/tests/fixtures/execution-context';
import { DecodedJwt } from '@/types/decoded-jwt';
import { userDecoratorFactory } from '../user.decorator';

describe('User Decorator [UNIT]', () => {
  const mockedUser: DecodedJwt = { username: 'user', exp: 0, iat: 0, aud: '', iss: '' };

  it('should return user when user is present', async () => {
    const mockExecutionContext = executionContextFactory({ user: mockedUser });
    const result = userDecoratorFactory(undefined, mockExecutionContext);
    expect(result).toEqual(mockedUser);
  });

  it('should return key value when user is present and key is provided', async () => {
    const mockExecutionContext = executionContextFactory({ user: mockedUser });
    const result = userDecoratorFactory('username', mockExecutionContext);
    expect(result).toEqual(mockedUser.username);
  });

  it('should return null when user is not present', async () => {
    const mockExecutionContext = executionContextFactory({});
    const result = userDecoratorFactory(undefined, mockExecutionContext);
    expect(result).toEqual(null);
  });

  it('should return null when user is present but key is not', async () => {
    const mockExecutionContext = executionContextFactory({ user: mockedUser });
    const result = userDecoratorFactory('randomKey', mockExecutionContext);
    expect(result).toEqual(null);
  });
});
