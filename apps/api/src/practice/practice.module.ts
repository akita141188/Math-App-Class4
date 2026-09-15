import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { HistoryFileModule } from '../history/history-file.module';
import { PracticeController } from './practice.controller';
import { PracticeServiceV2 } from './practice-service.v2';

@Module({
  imports: [ContentModule, HistoryFileModule],
  controllers: [PracticeController],
  providers: [PracticeServiceV2],
})
export class PracticeModule {}
