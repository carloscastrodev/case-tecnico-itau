import { isDevelopment, isTesting } from '@/utils/environment';
import { Table } from 'dynamoose';
import { MessageModel } from '../schemas/message/message.schema';

export const sharedTable = new Table('shared-table', [MessageModel], {
  create: isDevelopment() || isTesting(),
  throughput: {
    read: 50,
    write: 25,
  },
});
