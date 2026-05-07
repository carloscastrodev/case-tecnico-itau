import { JwtPayload } from 'jsonwebtoken';

export interface DecodedJwt extends JwtPayload {
  username: string;
  exp: number;
  iat: number;
  aud: string;
  iss: string;
}
