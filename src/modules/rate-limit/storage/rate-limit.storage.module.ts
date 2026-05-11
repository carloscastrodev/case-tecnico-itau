import { Module } from '@nestjs/common';
import { RateLimitStorageDynamoDB } from './rate-limit.storage.dynamodb';

@Module({
  providers: [RateLimitStorageDynamoDB],
  exports: [RateLimitStorageDynamoDB],
})
export class RateLimitStorageModule {}
