import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateMessageRequestDto } from '../request/create-message.request';
import { MESSAGE_STATUS, Message } from '@/lib/dynamoose/schemas/message/message.interface';
import { CreateMessageResponseDto } from '../response/create-message.response';
import { ListMessagesResponseDto } from '../response/list-messages.response';
import { PatchMessageStatusRequestDto } from '../request/patch-message-status.request';

const messageExample: Message = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  content: 'Olá, esta é uma mensagem de teste.',
  sender: 'user123',
  status: MESSAGE_STATUS.RECEIVED,
  createdAt: '2022-01-01T00:00:00.000Z',
  updatedAt: '2022-01-01T00:00:00.000Z',
};

export function MessageCreateDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Criação da mensagem' }),
    ApiBody({
      type: CreateMessageRequestDto,
      examples: {
        'Dados da mensagem': {
          value: {
            content: 'Olá, esta é uma mensagem de teste.',
            sender: 'user',
            status: MESSAGE_STATUS.RECEIVED,
          } as CreateMessageRequestDto,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Sucesso',
      example: messageExample as CreateMessageResponseDto,
    }),
  );
}

export function MessageFindDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary:
        'Listagem de mensagens por remetente e/ou período, ordenadas em ordem descendente da data de criação (por padrão)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sucesso',
      example: [messageExample as ListMessagesResponseDto],
    }),
  );
}

export function MessageFindByIdDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Busca da mensagem por ID' }),
    ApiParam({
      name: 'id',
      description: 'ID da mensagem',
      example: messageExample.id,
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sucesso',
      example: messageExample as Message,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Não encontrado',
      example: { statusCode: HttpStatus.NOT_FOUND, error: 'Not Found', message: 'Mensagem não encontrada' },
    }),
  );
}

export function MessagePatchStatusDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Atualização do status da mensagem' }),
    ApiBody({
      type: PatchMessageStatusRequestDto,
      examples: {
        'Dados da mensagem': {
          value: {
            status: MESSAGE_STATUS.READ,
          } as PatchMessageStatusRequestDto,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sucesso',
      example: messageExample as Message,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Não encontrado',
      example: { statusCode: HttpStatus.NOT_FOUND, error: 'Not Found', message: 'Mensagem não encontrada' },
    }),
  );
}
