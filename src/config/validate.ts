import { z } from 'zod';
import { ENVIRONMENT } from './environment';

export const envSchema = z.object({
  NODE_ENV: z.enum([ENVIRONMENT.PRODUCTION, ENVIRONMENT.DEVELOPMENT, ENVIRONMENT.TEST]),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  DYNAMODB_ENDPOINT: z.string(),
  PORT: z
    .string()
    .transform((val) => Number(val))
    .optional(),

  SWAGGER_TITLE: z.string().optional(),
  SWAGGER_DESCRIPTION: z.string().optional(),
  SWAGGER_VERSION: z.string().optional(),
  SWAGGER_TAG: z.string().optional(),
  SWAGGER_URL: z.string().optional(),

  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_ISSUER: z.string(),

  MOCKED_USER_USERNAME: z.string().optional(),
  MOCKED_USER_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (env: Record<string, any>): Env => envSchema.parse(env);
