import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTestAttemptDto, SubmitTestAttemptDto, UpdateTestAnswerDto } from './test-mode.dto';
import { TestModeService } from './test-mode.service';

@ApiTags('test-mode')
@Controller('v1')
export class TestModeController {
  constructor(private readonly tests: TestModeService) {}

  @Get('test-blueprints')
  listBlueprints() {
    return this.tests.listBlueprints();
  }

  @Post('test-attempts')
  create(@Body() input: CreateTestAttemptDto) {
    return this.tests.create(input);
  }

  @Get('test-attempts/:id')
  get(@Param('id') id: string) {
    return this.tests.get(id);
  }

  @Put('test-attempts/:id/answers/:questionId')
  updateAnswer(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() input: UpdateTestAnswerDto,
  ) {
    return this.tests.updateAnswer(id, questionId, input.answer);
  }

  @Post('test-attempts/:id/submit')
  submit(@Param('id') id: string, @Body() input: SubmitTestAttemptDto) {
    return this.tests.submit(id, input);
  }
}
