import { THROTTLE_BODY_FIELD } from '@/decorators/throttle-body-field.decorator';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerException,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class BodyThrottleGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const field = this.reflector.getAllAndOverride<string | undefined>(THROTTLE_BODY_FIELD, [
      requestProps.context.getHandler(),
      requestProps.context.getClass(),
    ]);

    return await super.handleRequest({
      ...requestProps,

      generateKey: (context) => {
        const req = context.switchToHttp().getRequest<Request>();
        const fieldToThrottle = (field && req.body?.[field]) || req.ip; //Fallback para IP caso o campo não esteja definido
        return `body-throttle:${field}:${fieldToThrottle}`;
      },
    });
  }

  protected async throwThrottlingException(_context: ExecutionContext): Promise<void> {
    throw new ThrottlerException('Muitas requisições. Por favor, tente novamente mais tarde.');
  }
}
