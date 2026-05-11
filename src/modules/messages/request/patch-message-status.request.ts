import { IsEnum, IsNotEmpty } from 'class-validator';
import { MESSAGE_STATUS } from '@/lib/dynamoose/schemas/message/message.interface';
import { ApiProperty } from '@nestjs/swagger';

export class PatchMessageStatusRequestDto {
  @IsEnum(MESSAGE_STATUS, { message: 'O status da mensagem deve ser um entre os valores definidos' })
  @IsNotEmpty({ message: 'O status da mensagem é obrigatório' })
  @ApiProperty({
    description: 'Status da mensagem',
    enum: MESSAGE_STATUS,
    example: MESSAGE_STATUS.RECEIVED,
    required: true,
  })
  status: MESSAGE_STATUS;
}
