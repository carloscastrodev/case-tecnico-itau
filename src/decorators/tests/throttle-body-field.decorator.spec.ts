import { DecodedJwt } from '@/types/decoded-jwt';
import { THROTTLE_BODY_FIELD, ThrottleBodyField } from '../throttle-body-field.decorator';

const mockSetMetadata = jest.fn();

jest.mock('@nestjs/core', () => ({
  SetMetadata: mockSetMetadata,
}));

describe('Throttle Body Field Decorator [UNIT]', () => {
  const mockedUser: DecodedJwt = { username: 'user', exp: 0, iat: 0, aud: '', iss: '' };

  it('should set metadata correctly', async () => {
    const field = 'field';
    ThrottleBodyField(field);

    expect(mockSetMetadata).toHaveBeenCalledWith(THROTTLE_BODY_FIELD, field);
  });
});
