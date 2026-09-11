import type { StudentAnswer } from '@math-app/shared';
import { IsDefined, IsInt, IsString, Min } from 'class-validator';

export class SubmitPracticeAnswerDto {
  @IsString()
  questionId!: string;

  @IsDefined()
  answer!: StudentAnswer;

  @IsInt()
  @Min(0)
  hintCount!: number;
}
