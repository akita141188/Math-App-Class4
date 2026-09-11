import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentServiceV2 } from './content-service.v2';

@Module({
  controllers: [ContentController],
  providers: [ContentServiceV2, { provide: ContentService, useExisting: ContentServiceV2 }],
  exports: [ContentServiceV2, ContentService],
})
export class ContentModule {}
