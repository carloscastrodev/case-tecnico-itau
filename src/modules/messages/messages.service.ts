import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateMessageRequestDto } from './request/create-message.request';
import { PatchMessageStatusRequestDto } from './request/patch-message-status.request';

@Injectable()
export class MessagesService {
  create(createMessageDto: CreateMessageRequestDto) {
    throw new NotImplementedException('not implemented');
  }

  findAll() {
    throw new NotImplementedException('not implemented');
  }

  findById(id: string) {
    throw new NotImplementedException('not implemented');
  }

  patchStatus(id: string, patchMessageStatusRequestDto: PatchMessageStatusRequestDto) {
    throw new NotImplementedException('not implemented');
  }
}
