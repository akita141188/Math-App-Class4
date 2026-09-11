import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckAnswerDto {
  @ApiProperty({ example: 'demo-multiplication-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  problemId!: string;

  @ApiProperty({ example: '1 470 chiếc bánh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  answer!: string;
}
