import { Module } from '@nestjs/common';
import { HistoryFileController } from './history-file.controller';
import { HistoryFileService } from './history-file.service';

@Module({
  controllers: [HistoryFileController],
  providers: [HistoryFileService],
  exports: [HistoryFileService],
})
export class HistoryFileModule {}
