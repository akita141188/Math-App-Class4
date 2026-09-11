import type { DemoProblem } from '@math-app/shared';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProblemService } from './problem.service';

@ApiTags('problems')
@Controller('v1/problems')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('demo')
  @ApiOkResponse({ description: 'A safe, predefined Grade 4 word problem.' })
  getDemoProblem(): DemoProblem {
    return this.problemService.getDemoProblem();
  }
}
