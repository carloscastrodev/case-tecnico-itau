import { THROTTLE_BODY_FIELD, ThrottleBodyField } from '../throttle-body-field.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

import { SetMetadata } from '@nestjs/common';
const mockSetMetadata = SetMetadata as jest.Mock;

describe('Throttle Body Field Decorator [UNIT]', () => {
  it('should set metadata correctly', async () => {
    const field = 'field';
    ThrottleBodyField(field);

    expect(mockSetMetadata).toHaveBeenCalledWith(THROTTLE_BODY_FIELD, field);
  });
});
