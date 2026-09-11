import type { CheckAnswerResponse } from '@math-app/shared';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CheckAnswerDto } from './check-answer.dto';
import { LearningSessionService } from './learning-session.service';

@ApiTags('learning sessions')
@Controller('v1/learning-sessions')
export class LearningSessionController {
  constructor(private readonly learningSessionService: LearningSessionService) {}

  @Post('demo/check')
  @ApiOkResponse({ description: 'Checks the predefined demo answer.' })
  @ApiBadRequestResponse({ description: 'Input did not pass validation.' })
  checkDemoAnswer(@Body() input: CheckAnswerDto): CheckAnswerResponse {
    return this.learningSessionService.checkDemoAnswer(input);
  }
}
