import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInRequestDto {
  @IsString({ message: 'Nome de usuário deve ser uma string' })
  @IsNotEmpty({ message: 'Nome de usuário é obrigatório' })
  @ApiProperty({
    description: 'Nome de usuário',
    example: 'user',
    required: true,
  })
  username: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @ApiProperty({
    description: 'Senha',
    example: 'password',
    required: true,
  })
  password: string;
}
