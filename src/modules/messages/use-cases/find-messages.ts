import { IMessageRepository } from '@/modules/messages/repositories/message.repository.interface';
import { Injectable } from '@nestjs/common';
import { ListMessagesResponseDto } from '../response/list-messages.response';
import { ListMessagesQueryRequestDto } from '../request/list-messages-query.request';

@Injectable()
export class FindMessagesUseCase {
  private readonly DEFAULT_LIMIT = 10;

  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(query: ListMessagesQueryRequestDto): Promise<ListMessagesResponseDto[]> {
    const { startDate, endDate, sender, limit = this.DEFAULT_LIMIT, order } = query;

    if (sender) {
      return await this.messageRepository.findBySenderAndOptionalDateRange({
        sender,
        startDate,
        endDate,
        limit,
        order,
      });
    } else {
      return await this.messageRepository.findByDateRange({ startDate, endDate, limit, order });
    }
  }
}
