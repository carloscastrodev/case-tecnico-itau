import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MESSAGE_STATUS } from '@/lib/dynamoose/schemas/message/message.interface';

export class CreateMessageRequestDto {
  @IsString({ message: 'Informe o conteúdo da mensagem' })
  @IsNotEmpty({ message: 'O conteúdo da mensagem é obrigatório' })
  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, esta é uma mensagem de teste.',
    required: true,
  })
  content: string;

  @IsString({ message: 'Informe o remetente da mensagem' })
  @IsNotEmpty({ message: 'O remetente da mensagem é obrigatório' })
  @ApiProperty({
    description: 'Identificador do remetente da mensagem',
    example: 'user',
    required: true,
  })
  sender: string;

  @IsEnum(MESSAGE_STATUS, { message: 'Informe o status da mensagem' })
  @IsNotEmpty({ message: 'O status da mensagem é obrigatório' })
  @ApiProperty({
    description: 'Status da mensagem',
    enum: MESSAGE_STATUS,
    example: MESSAGE_STATUS.RECEIVED,
    required: true,
  })
  status: MESSAGE_STATUS;
}
