import { ENVIRONMENT } from './environment';

const config = () => ({
  NODE_ENV: process.env.NODE_ENV as ENVIRONMENT,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
  PORT: process.env.PORT,

  SWAGGER_TITLE: process.env.SWAGGER_TITLE,
  SWAGGER_DESCRIPTION: process.env.SWAGGER_DESCRIPTION,
  SWAGGER_VERSION: process.env.SWAGGER_VERSION,
  SWAGGER_TAG: process.env.SWAGGER_TAG,
  SWAGGER_URL: process.env.SWAGGER_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
});

export type Config = ReturnType<typeof config>;

export default config;
