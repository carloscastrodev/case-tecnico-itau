import { IMessageRepository } from '@/modules/messages/repositories/message.repository.interface';
import { Injectable } from '@nestjs/common';
import { CreateMessageRequestDto } from '../request/create-message.request';
import { CreateMessageResponseDto } from '../response/create-message.response';

@Injectable()
export class CreateMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(createMessageDto: CreateMessageRequestDto): Promise<CreateMessageResponseDto> {
    return await this.messageRepository.create(createMessageDto);
  }
}
