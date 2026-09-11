import type { Difficulty, PracticeMode } from '@math-app/shared';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePracticeSessionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  grade!: number;

  @IsArray()
  @IsString({ each: true })
  problemTypeIds!: string[];

  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: Difficulty;

  @IsInt()
  @Min(1)
  @Max(20)
  questionCount!: number;

  @IsIn(['PRACTICE', 'LEARN', 'REVIEW'])
  mode!: PracticeMode;
}
