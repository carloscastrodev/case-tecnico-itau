import { SetMetadata } from '@nestjs/common';

export const THROTTLE_BODY_FIELD = 'throttle:body-field';

export const ThrottleBodyField = (field: string) => SetMetadata(THROTTLE_BODY_FIELD, field);
