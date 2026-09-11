import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { PracticeController } from './practice.controller';
import { PracticeServiceV2 } from './practice-service.v2';

@Module({
  imports: [ContentModule],
  controllers: [PracticeController],
  providers: [PracticeServiceV2],
})
export class PracticeModule {}
