import { ENVIRONMENT } from '@/config/environment';

export const isProduction = (): boolean => process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;