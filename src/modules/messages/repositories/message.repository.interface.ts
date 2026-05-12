import { Message, MESSAGE_STATUS } from '@/lib/dynamoose/schemas/message/message.interface';
import { ORDER } from '@/types/order-enum';

export abstract class IMessageRepository {
  abstract findById(id: string): Promise<Message | null>;
  abstract findBySenderAndOptionalDateRange({
    sender,
    startDate,
    endDate,
    limit,
    order,
  }: {
    sender: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    order?: ORDER;
  }): Promise<Message[]>;
  abstract findByDateRange({
    startDate,
    endDate,
    limit,
    order,
  }: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    order?: ORDER;
  }): Promise<Message[]>;
  abstract create(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message>;
  abstract patchStatus(id: string, status: MESSAGE_STATUS): Promise<Message | null>;
}
