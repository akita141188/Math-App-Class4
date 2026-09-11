import type { CurriculumTopic } from '@math-app/shared';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurriculumService } from './curriculum.service';

@ApiTags('curriculum')
@Controller('v1/curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get('topics')
  @ApiOkResponse({ description: 'Grade 4 topics used by the review prototype.' })
  getTopics(): CurriculumTopic[] {
    return this.curriculumService.getTopics();
  }
}
