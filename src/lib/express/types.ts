import { DecodedJwt } from '@/types/decoded-jwt';

declare module 'express' {
  export interface Request {
    user?: DecodedJwt;
  }
}
