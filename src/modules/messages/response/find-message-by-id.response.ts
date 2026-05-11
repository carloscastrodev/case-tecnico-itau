import { MESSAGE_STATUS } from '@/lib/dynamoose/schemas/message/message.interface';
import { ApiProperty } from '@nestjs/swagger';

export class FindMessageByIdResponseDto {
  @ApiProperty({
    description: 'Id da mensagem',
    example: '123e4567-e89b-12d3-a456-426614174000',
    readOnly: true,
  })
  id: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, esta é uma mensagem de teste.',
  })
  content: string;

  @ApiProperty({
    description: 'Identificador do remetente da mensagem',
    example: 'user123',
  })
  sender: string;

  @ApiProperty({
    description: 'Status da mensagem',
    example: MESSAGE_STATUS.SENT,
    enum: MESSAGE_STATUS,
  })
  status: MESSAGE_STATUS;

  @ApiProperty({
    description: 'Data de criação da mensagem',
    example: new Date().toISOString(),
  })
  createdAt: string;

  @ApiProperty({
    description: 'Data de atualização da mensagem',
    example: new Date().toISOString(),
  })
  updatedAt: string;
}
