import { Injectable, NotFoundException } from '@nestjs/common';
import { IMessageRepository } from '@/modules/messages/repositories/message.repository.interface';
import { FindMessageByIdResponseDto } from '../response/find-message-by-id.response';

@Injectable()
export class FindMessageByIdUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(id: string): Promise<FindMessageByIdResponseDto> {
    const message = await this.messageRepository.findById(id);

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    return message;
  }
}
