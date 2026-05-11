import { RATE_LIMIT_MODEL } from '@/lib/dynamoose/dynamoose.models.module';
import { RateLimitKey, RateLimitWithKey } from '@/lib/dynamoose/schemas/rate-limit/rate-limit.interface';
import { Inject, Injectable } from '@nestjs/common';
import { type Model } from 'nestjs-dynamoose';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RateLimitStorageDynamoDB implements ThrottlerStorage {
  constructor(
    @Inject(RATE_LIMIT_MODEL)
    private readonly rateLimitModel: Model<RateLimitWithKey, RateLimitKey>,
    private readonly logger: Logger,
  ) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const pk = this.getPK(key, throttlerName);
    const nowMs = Date.now();
    const nowSec = Math.floor(nowMs / 1000);
    const ttlSec = Math.ceil(ttl / 1000);

    const existing = await this.rateLimitModel.get({ pk });

    const isExpired = !existing || existing.ttl <= nowSec;
    const isBlockActive = !!existing && existing.blockExpiresAt > nowMs;

    if (isBlockActive) {
      this.logger.warn({
        context: {
          pk,
          existing,
        },
        message: 'Requisição bloqueada: rate limit ativo',
      });

      return {
        totalHits: existing!.totalHits,
        timeToExpire: Math.max(0, existing!.ttl - nowSec),
        isBlocked: true,
        timeToBlockExpire: Math.ceil((existing!.blockExpiresAt - nowMs) / 1000),
      };
    }

    let totalHits: number;
    let expiresAtSec: number;

    if (isExpired) {
      expiresAtSec = nowSec + ttlSec;
      await this.rateLimitModel.update(
        { pk },
        {
          ttl: expiresAtSec,
          totalHits: 1,
          limit,
          blockDuration,
          blockExpiresAt: 0,
          throttlerName,
          createdAt: new Date(nowMs).toISOString(),
        },
      );
      totalHits = 1;
    } else {
      expiresAtSec = existing!.ttl;
      const updated = await this.rateLimitModel.update({ pk }, { $ADD: { totalHits: 1 } });
      totalHits = updated.totalHits;
    }

    const exceeded = totalHits > limit;
    let blockExpiresAtMs = 0;
    if (exceeded && blockDuration > 0) {
      this.logger.warn({
        context: {
          pk,
          existing,
        },
        message: 'Rate limit excedido',
      });

      blockExpiresAtMs = nowMs + blockDuration;
      await this.rateLimitModel.update({ pk }, { blockExpiresAt: blockExpiresAtMs });
    }

    return {
      totalHits,
      timeToExpire: Math.max(0, expiresAtSec - nowSec),
      isBlocked: exceeded,
      timeToBlockExpire: blockExpiresAtMs > 0 ? Math.ceil((blockExpiresAtMs - nowMs) / 1000) : 0,
    };
  }

  private getPK(key: string, throttlerName: string) {
    return `RATE_LIMIT#${throttlerName}#${key}`;
  }
}
