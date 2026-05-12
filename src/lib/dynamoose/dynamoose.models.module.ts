import { Global, Module, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { MessageModel } from './schemas/message/message.schema';
import { isDevelopment, isTesting } from '@/utils/environment';
import { Table } from 'dynamoose';
import { RateLimitModel } from './schemas/rate-limit/rate-limit.schema';

export const MESSAGE_MODEL = Symbol('MESSAGE_MODEL');
export const RATE_LIMIT_MODEL = Symbol('RATE_LIMIT_MODEL');

export const SHARED_TABLE = Symbol('SHARED_TABLE');
export const SHARED_TABLE_NAME = 'shared-table';

@Global()
@Module({
  providers: [
    {
      provide: SHARED_TABLE,
      inject: [],
      useFactory: () =>
        new Table(SHARED_TABLE_NAME, [MessageModel, RateLimitModel], {
          create: isDevelopment() || isTesting(),
          update: isDevelopment() || isTesting(),
          waitForActive: { enabled: isDevelopment() || isTesting() },
          initialize: false,
          expires: {
            attribute: 'ttl',
            items: {
              returnExpired: false,
            },
          },
        }),
    },
    { provide: MESSAGE_MODEL, useValue: MessageModel },
    { provide: RATE_LIMIT_MODEL, useValue: RateLimitModel },
  ],
  exports: [SHARED_TABLE, MESSAGE_MODEL, RATE_LIMIT_MODEL],
})
export class DynamooseModelsModule implements OnApplicationBootstrap {
  constructor(@Inject(SHARED_TABLE) private readonly table: typeof Table) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.table.initialize();
  }
}
