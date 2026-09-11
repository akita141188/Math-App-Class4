import type { StudentAnswer } from '@math-app/shared';
import { IsArray, IsDefined, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTestAttemptDto {
  @IsString()
  blueprintId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recentQuestionIds?: string[];

  @IsOptional()
  @IsString()
  randomSeed?: string;
}

export class UpdateTestAnswerDto {
  @IsDefined()
  answer!: StudentAnswer;
}

export class SubmitTestAttemptDto {
  @IsObject()
  answers!: Record<string, StudentAnswer>;
}
