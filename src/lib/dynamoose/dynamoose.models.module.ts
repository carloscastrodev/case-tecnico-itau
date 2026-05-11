import { Global, Module } from '@nestjs/common';
import { MessageModel } from './schemas/message/message.schema';
import { isDevelopment, isTesting } from '@/utils/environment';
import { Table } from 'dynamoose';

export const MESSAGE_MODEL = Symbol('MESSAGE_MODEL');
export const SHARED_TABLE = Symbol('SHARED_TABLE');
export const SHARED_TABLE_NAME = 'shared-table';

@Global()
@Module({
  providers: [
    {
      provide: SHARED_TABLE,
      useValue: () =>
        new Table(SHARED_TABLE_NAME, [MessageModel], {
          create: isDevelopment() || isTesting(),
          waitForActive: { enabled: isDevelopment() || isTesting() },
          throughput: {
            read: 50,
            write: 25,
          },
        }),
    },
    { provide: MESSAGE_MODEL, useValue: MessageModel },
  ],
  exports: [SHARED_TABLE, MESSAGE_MODEL],
})
export class DynamooseModelsModule {}
