import { ENVIRONMENT } from '@/config/environment';

export const isDevelopment = (): boolean => process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;
export const isProduction = (): boolean => process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;
export const isTesting = (): boolean => process.env.NODE_ENV === ENVIRONMENT.TEST;
