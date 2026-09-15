import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HistoryFileService } from './history-file.service';

@ApiTags('history')
@Controller('v1/history')
export class HistoryFileController {
  constructor(private readonly history: HistoryFileService) {}

  @Get()
  getStore() {
    return this.history.getStore();
  }

  @Post('records')
  saveRecord(@Body() body: unknown) {
    return this.history.saveRecord(body);
  }

  @Put('in-progress/:id')
  saveDraft(@Param('id') id: string, @Body() body: unknown) {
    return this.history.saveDraft(id, body);
  }

  @Delete('records/:id')
  deleteRecord(@Param('id') id: string) {
    return this.history.deleteRecord(id);
  }

  @Delete('in-progress/:id')
  deleteDraft(@Param('id') id: string) {
    return this.history.deleteDraft(id);
  }

  @Post('import-local')
  importLocal(@Body() body: unknown) {
    return this.history.importLocal(body);
  }

  @Delete()
  clearAll() {
    return this.history.clearAll();
  }
}
