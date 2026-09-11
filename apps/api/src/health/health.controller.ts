import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: 'API is ready.' })
  getHealth(): { status: 'ok'; service: string } {
    return { status: 'ok', service: 'math-app-class4-api' };
  }
}
