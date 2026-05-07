import { DecodedJwt } from '@/types/decoded-jwt';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const userDecoratorFactory = (
  key: keyof DecodedJwt | undefined,
  ctx: ExecutionContext,
): DecodedJwt[keyof DecodedJwt] | DecodedJwt | null => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const user = request.user;

  if (key) {
    return user?.[key] ?? null;
  }

  return user ?? null;
};

export const User = createParamDecorator(userDecoratorFactory);
