import type { DifficultyMode, PracticeMode, RecentQuestionReference } from '@math-app/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class RecentQuestionReferenceDto implements RecentQuestionReference {
  @IsString()
  problemTypeId!: string;

  @IsString()
  questionId!: string;

  @IsString()
  fingerprint!: string;

  @IsISO8601()
  lastSeenAt!: string;
}

export class CreatePracticeSessionV2Dto {
  @IsInt()
  @Min(4)
  @Max(4)
  grade!: number;

  @IsArray()
  @IsString({ each: true })
  problemTypeIds!: string[];

  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD', 'ALL'])
  difficulty?: DifficultyMode;

  @IsIn(['ALL', ...Array.from({ length: 50 }, (_, index) => index + 1)])
  questionCount!: number | 'ALL';

  @IsIn(['PRACTICE', 'LEARN', 'REVIEW'])
  mode!: PracticeMode;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecentQuestionReferenceDto)
  recentQuestions?: RecentQuestionReferenceDto[];

  @IsOptional()
  @IsString()
  randomSeed?: string;
}
