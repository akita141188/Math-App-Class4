import type { CurriculumTopic } from '@math-app/shared';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Ruler, Shapes } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurriculumTopics } from '../api/client';
import { PageContainer } from '../components/PageContainer';

const fallbackTopics: CurriculumTopic[] = [
  { id: 'division', name: 'Phép chia', skill: 'Chia cho số có một chữ số' },
  { id: 'measurement', name: 'Đổi đơn vị đo', skill: 'Độ dài và khối lượng' },
  { id: 'word-problems', name: 'Bài toán có lời văn', skill: 'Tìm phép tính phù hợp' },
];

const icons = [Shapes, Ruler, BookOpen];

export function ReviewPage() {
  const topicsQuery = useQuery({
    queryKey: ['curriculum-topics'],
    queryFn: getCurriculumTopics,
  });
  const topics = topicsQuery.data ?? fallbackTopics;

  return (
    <PageContainer>
      <header className="page-intro">
        <span className="page-kicker">Ôn tập</span>
        <h1>Mỗi ngày vững hơn một chút</h1>
        <p>Đây là những phần em nên luyện lại. Mình bắt đầu từ bài ngắn nhé.</p>
      </header>
      {topicsQuery.isLoading ? (
        <div className="loading-list" aria-label="Đang tải nội dung ôn tập">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <div className="review-list">
          {topics.map((topic, index) => {
            const Icon = icons[index % icons.length] ?? BookOpen;
            return (
              <article className="review-row" key={topic.id}>
                <span className="review-icon">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <div>
                  <h2>{topic.name}</h2>
                  <p>{topic.skill}</p>
                </div>
                <span className="practice-length">5 phút</span>
                <Link to="/learn/session" aria-label={'Luyện ' + topic.name}>
                  Luyện ngay <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      )}
      {topicsQuery.isError && (
        <p className="gentle-status" role="status">
          Đang hiển thị kế hoạch ôn tập có sẵn.
        </p>
      )}
    </PageContainer>
  );
}
