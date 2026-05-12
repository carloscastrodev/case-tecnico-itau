import { ORDER } from '@/types/order-enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export class ListMessagesQueryRequestDto {
  @ValidateIf(({ startDate, endDate }: ListMessagesQueryRequestDto) => !startDate && !endDate, {
    message: 'Informe o remetente e/ou um período de datas',
  })
  @IsString({ message: 'O remetente deve ser uma string' })
  @ApiPropertyOptional({
    description: 'Remetente da mensagem (requerido se não for informado data de início ou de fim)',
    example: 'user',
  })
  sender: string;

  @ValidateIf(({ startDate, sender, endDate }: ListMessagesQueryRequestDto) => !!startDate || (!sender && !endDate), {
    message: 'Informe o remetente e/ou um período de datas',
  })
  @IsDateString(
    {
      strict: true,
    },
    { message: 'Informe uma data/hora de início válida em formato ISO 8601' },
  )
  @ApiPropertyOptional({
    description:
      'Data/hora de início da busca em formato ISO 8601 (requerido se não for informado remetente ou data de fim)',
    example: new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
  })
  startDate: string;

  @ValidateIf(({ sender, startDate, endDate }: ListMessagesQueryRequestDto) => !!endDate || (!sender && !startDate), {
    message: 'Informe o remetente e/ou um período de datas',
  })
  @IsDateString(
    {
      strict: true,
    },
    { message: 'Informe uma data/hora de fim válida em formato ISO 8601' },
  )
  @ApiPropertyOptional({
    description:
      'Data/hora de fim da busca em formato ISO 8601 (requerido se não for informado remetente ou data de início)',
    example: new Date().toISOString().slice(0, 10) + 'T23:59:59.999Z',
  })
  endDate: string;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @IsInt({
    message: 'Deve ser um número inteiro',
  })
  @Min(1, {
    message: 'O limite deve ser maior ou igual a 1',
  })
  @Max(100, {
    message: 'O limite deve ser menor ou igual a 100',
  })
  @ApiProperty({
    description: 'Limite de mensagens a serem retornadas (1 e 100)',
    example: 10,
    required: false,
    default: 10,
  })
  limit?: number;

  @IsEnum(ORDER, { message: 'O order deve ser ASC ou DESC' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Ordenação das mensagens',
    example: ORDER.DESC,
    required: false,
    default: ORDER.DESC,
  })
  order?: ORDER;
}
