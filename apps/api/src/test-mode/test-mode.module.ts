import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { HistoryFileModule } from '../history/history-file.module';
import { TestModeController } from './test-mode.controller';
import { TestModeService } from './test-mode.service';

@Module({
  imports: [ContentModule, HistoryFileModule],
  controllers: [TestModeController],
  providers: [TestModeService],
})
export class TestModeModule {}
