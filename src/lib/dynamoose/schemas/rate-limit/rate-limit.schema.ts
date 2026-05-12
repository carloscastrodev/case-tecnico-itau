import { model, Schema } from 'dynamoose';

export const RateLimitSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true,
    },
    ttl: {
      type: Number,
    },
    totalHits: {
      type: Number,
      default: 0,
    },
    blockExpiresAt: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
    },
    blockDuration: {
      type: Number,
    },
    throttlerName: {
      type: String,
    },
    createdAt: {
      type: String,
    },
  },
  {
    saveUnknown: false,
    timestamps: false,
  },
);

export const RateLimitModelName = 'RateLimit';
export const RateLimitModel = model(RateLimitModelName, RateLimitSchema, { initialize: false });
