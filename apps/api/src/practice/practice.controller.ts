import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePracticeSessionV2Dto } from './create-practice-session-v2.dto';
import { PracticeServiceV2 } from './practice-service.v2';
import { SubmitPracticeAnswerDto } from './submit-practice-answer.dto';

@ApiTags('practice')
@Controller('v1/practice-sessions')
export class PracticeController {
  constructor(private readonly practiceService: PracticeServiceV2) {}

  @Post()
  create(@Body() input: CreatePracticeSessionV2Dto) {
    return this.practiceService.create(input);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.practiceService.get(id);
  }

  @Post(':id/answer')
  answer(@Param('id') id: string, @Body() input: SubmitPracticeAnswerDto) {
    return this.practiceService.answer(id, input);
  }
}
