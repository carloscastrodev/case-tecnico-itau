import { Injectable, NotFoundException } from '@nestjs/common';
import { IMessageRepository } from '@/modules/messages/repositories/message.repository.interface';
import { PatchMessageStatusResponseDto } from '../response/patch-message-status.response';
import { PatchMessageStatusRequestDto } from '../request/patch-message-status.request';

@Injectable()
export class PatchMessageStatusUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(
    id: string,
    patchMessageStatusRequestDto: PatchMessageStatusRequestDto,
  ): Promise<PatchMessageStatusResponseDto> {
    const message = await this.messageRepository.patchStatus(id, patchMessageStatusRequestDto.status);

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    return message;
  }
}
