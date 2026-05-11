import { IMessageRepository } from '@/modules/messages/repositories/message.repository.interface';
import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import * as MessageUseCases from './use-cases';
import { MessageRepositoryDynamoose } from './repositories/message.repository.dynamoose';

@Module({
  imports: [],
  controllers: [MessagesController],
  providers: [
    {
      provide: IMessageRepository,
      useClass: MessageRepositoryDynamoose,
    },
    ...Object.values(MessageUseCases),
  ],
})
export class MessagesModule {}
