import { DecodedJwt } from '@/types/decoded-jwt';
import { ExecutionContext } from '@nestjs/common';

export const executionContextFactory = ({
  headers,
  user,
}: {
  headers?: Record<string, string>;
  user?: DecodedJwt;
}): ExecutionContext =>
  ({
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ headers, user }),
    }),
  }) as unknown as ExecutionContext;
