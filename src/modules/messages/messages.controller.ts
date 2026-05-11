import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { CreateMessageRequestDto } from './request/create-message.request';
import { PatchMessageStatusRequestDto } from './request/patch-message-status.request';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '@/guards/authenticated.guard';
import {
  MessageCreateDocs,
  MessageFindByIdDocs,
  MessageFindDocs,
  MessagePatchStatusDocs,
} from './docs/messages.controller.docs';
import { ListMessagesQueryRequestDto } from './request/list-messages-query.request';
import {
  CreateMessageUseCase,
  FindMessageByIdUseCase,
  FindMessagesUseCase,
  PatchMessageStatusUseCase,
} from './use-cases';

@Controller('messages')
@ApiTags('Mensagens')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth('JWT')
export class MessagesController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly findMessagesUseCase: FindMessagesUseCase,
    private readonly findMessageByIdUseCase: FindMessageByIdUseCase,
    private readonly patchMessageStatusUseCase: PatchMessageStatusUseCase,
  ) {}

  @Post()
  @MessageCreateDocs()
  async create(@Body() createMessageDto: CreateMessageRequestDto) {
    return this.createMessageUseCase.execute(createMessageDto);
  }

  @Get()
  @MessageFindDocs()
  async find(@Query() query: ListMessagesQueryRequestDto) {
    return this.findMessagesUseCase.execute(query);
  }

  @Get(':id')
  @MessageFindByIdDocs()
  async findById(@Param('id') id: string) {
    return this.findMessageByIdUseCase.execute(id);
  }

  @Patch(':id/status')
  @MessagePatchStatusDocs()
  async patchStatus(@Param('id') id: string, @Body() patchMessageStatusRequestDto: PatchMessageStatusRequestDto) {
    return this.patchMessageStatusUseCase.execute(id, patchMessageStatusRequestDto);
  }
}
