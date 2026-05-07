import { ExecutionContext } from '@nestjs/common';

export const executionContextFactory = ({ headers }: { headers: Record<string, string> }): ExecutionContext =>
  ({
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ headers }),
    }),
  }) as unknown as ExecutionContext;
