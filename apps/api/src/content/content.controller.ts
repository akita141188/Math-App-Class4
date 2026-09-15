import type { Difficulty } from '@math-app/shared';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('curriculum')
@Controller('v1')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('grades')
  getGrades() {
    return this.contentService.getGrades();
  }

  @Get('grades/:grade/domains')
  getDomains(@Param('grade', ParseIntPipe) grade: number) {
    return this.contentService.getDomains(grade);
  }

  @Get('grades/:grade/topics')
  getTopics(@Param('grade', ParseIntPipe) grade: number) {
    return this.contentService.getTopics(grade);
  }

  @Get('grades/:grade/catalog')
  getCatalog(@Param('grade', ParseIntPipe) grade: number) {
    return grade === 4 ? this.contentService.getCatalog() : null;
  }

  @Get('grades/:grade/official-curriculum')
  getOfficialCurriculum(@Param('grade', ParseIntPipe) grade: number) {
    return grade === 4 ? this.contentService.getOfficialCurriculum() : null;
  }

  @Get('topics/:topicId/problem-types')
  getProblemTypes(@Param('topicId') topicId: string) {
    return this.contentService.getProblemTypes(topicId);
  }

  @Get('problem-types/:id')
  getProblemType(@Param('id') id: string) {
    return this.contentService.getProblemType(id);
  }

  @Get('questions')
  getQuestions(
    @Query('problemTypeIds') problemTypeIds?: string,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('limit') limit?: string,
  ) {
    return this.contentService.getQuestions({
      problemTypeIds: problemTypeIds?.split(',').filter(Boolean),
      difficulty,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('content/stats')
  getStats() {
    return this.contentService.stats();
  }
}
