import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { BodyThrottleGuard } from '@/guards/body-throttle.guard';
import { RateLimitStorageDynamoDB } from './storage/rate-limit.storage.dynamodb';
import { RateLimitStorageModule } from './storage/rate-limit.storage.module';

@Global()
@Module({
  imports: [
    RateLimitStorageModule,
    ThrottlerModule.forRootAsync({
      imports: [RateLimitStorageModule],
      inject: [RateLimitStorageDynamoDB],
      useFactory: (storage: RateLimitStorageDynamoDB) => ({
        throttlers: [
          {
            name: 'default',
            limit: 10,
            ttl: 60_000,
          },
        ],
        storage,
      }),
    }),
  ],
  controllers: [],
  providers: [BodyThrottleGuard],
  exports: [RateLimitStorageModule, ThrottlerModule, BodyThrottleGuard],
})
export class RateLimitModule {}
