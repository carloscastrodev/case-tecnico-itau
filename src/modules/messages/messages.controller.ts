import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageRequestDto } from './request/create-message.request';
import { PatchMessageStatusRequestDto } from './request/patch-message-status.request';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post()
  create(@Body() createMessageDto: CreateMessageRequestDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.messagesService.findById(id);
  }

  @Patch(':id/status')
  patchStatus(@Param('id') id: string, @Body() patchMessageStatusRequestDto: PatchMessageStatusRequestDto) {
    return this.messagesService.patchStatus(id, patchMessageStatusRequestDto);
  }
}
