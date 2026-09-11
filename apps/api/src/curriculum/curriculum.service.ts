import type { CurriculumTopic } from '@math-app/shared';
import { Injectable } from '@nestjs/common';

const topics: CurriculumTopic[] = [
  { id: 'division-one-digit', name: 'Phép chia', skill: 'Chia cho số có một chữ số' },
  { id: 'measurement-conversion', name: 'Đổi đơn vị đo', skill: 'Độ dài và khối lượng' },
  { id: 'word-problems', name: 'Bài toán có lời văn', skill: 'Tìm phép tính phù hợp' },
];

@Injectable()
export class CurriculumService {
  getTopics(): CurriculumTopic[] {
    return topics;
  }
}
