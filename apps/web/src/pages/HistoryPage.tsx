import type { LearningHistoryRecord } from '@math-app/shared';
import { BookOpenCheck, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';

function completedAt(record: LearningHistoryRecord): string {
  return record.sessionType === 'PRACTICE' ? record.completedAt : record.submittedAt;
}

export function HistoryPage() {
  const [filter, setFilter] = useState<'ALL' | 'PRACTICE' | 'TEST'>('ALL');
  const records = localLearningHistoryRepository
    .list()
    .filter((record) => filter === 'ALL' || record.sessionType === filter);
  return (
    <PageContainer>
      <header className={'page-intro'}>
        <span className={'page-kicker'}>Lịch sử học</span>
        <h1>Những lần em đã hoàn thành</h1>
        <p>Kết quả được lưu trên thiết bị này để em và gia đình theo dõi tiến bộ.</p>
      </header>
      <div className={'history-filters'} role={'group'} aria-label={'Lọc lịch sử'}>
        {(['ALL', 'PRACTICE', 'TEST'] as const).map((value) => (
          <button
            key={value}
            type={'button'}
            className={filter === value ? 'active' : ''}
            onClick={() => setFilter(value)}
          >
            {value === 'ALL' ? 'Tất cả' : value === 'PRACTICE' ? 'Luyện tập' : 'Kiểm tra'}
          </button>
        ))}
      </div>
      {records.length === 0 ? (
        <div className={'empty-state'}>
          <h2>Chưa có buổi học đã hoàn thành</h2>
          <p>Hoàn thành một bộ luyện tập hoặc bài kiểm tra để xem kết quả tại đây.</p>
          <Link className={'button button-primary'} to={'/learn/types'}>
            Chọn dạng để luyện
          </Link>
        </div>
      ) : (
        <div className={'history-list'}>
          {records.slice(0, 50).map((record) => (
            <article key={record.id} className={'history-card'}>
              {record.sessionType === 'PRACTICE' ? <BookOpenCheck /> : <ClipboardCheck />}
              <div>
                <span className={'page-kicker'}>
                  {record.sessionType === 'PRACTICE' ? 'Luyện tập' : 'Bài kiểm tra'}
                </span>
                <h2>
                  {record.sessionType === 'PRACTICE'
                    ? record.selectedLeafTypeIds.join(', ')
                    : record.testTitle}
                </h2>
                <time dateTime={completedAt(record)}>
                  {new Date(completedAt(record)).toLocaleString('vi-VN')}
                </time>
                <p>
                  {record.questionResults.length} câu · {record.correctCount} đúng ·{' '}
                  {record.incorrectCount} sai · {record.unansweredCount} bỏ qua
                </p>
              </div>
              <strong className={'history-score'}>
                {record.sessionType === 'TEST'
                  ? `${record.finalScore10}/10`
                  : `${record.accuracyPercent}%`}
              </strong>
              <Link className={'button button-secondary'} to={`/history/${record.id}`}>
                Xem chi tiết
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
