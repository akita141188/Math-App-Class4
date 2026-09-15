import type { LearningHistoryRecord } from '@math-app/shared';
import { BookOpenCheck, ClipboardCheck, Clock3, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { inProgressSessionRepository } from '../features/progress/inProgressSessionRepository';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';

function completedAt(record: LearningHistoryRecord): string {
  return record.sessionType === 'PRACTICE' ? record.completedAt : record.submittedAt;
}

export function HistoryPage() {
  const [filter, setFilter] = useState<'ALL' | 'PRACTICE' | 'TEST'>('ALL');
  const drafts = inProgressSessionRepository
    .list()
    .filter((draft) => filter === 'ALL' || draft.sessionType === filter);
  const records = localLearningHistoryRepository
    .list()
    .filter((record) => filter === 'ALL' || record.sessionType === filter);

  return (
    <PageContainer>
      <header className={'page-intro'}>
        <span className={'page-kicker'}>Lịch sử học</span>
        <h1>Bài đang làm dở và kết quả đã hoàn thành</h1>
        <p>Khi em thoát một bài đang làm, ứng dụng sẽ lưu lại tại đây để em có thể tiếp tục sau.</p>
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

      {drafts.length > 0 && (
        <section className={'history-in-progress'}>
          <div className={'history-section-title'}>
            <div>
              <Clock3 size={20} />
              <h2>Đang làm dở</h2>
            </div>
            <span>{drafts.length} bài</span>
          </div>
          <div className={'history-list'}>
            {drafts.map((draft) => (
              <article
                key={`${draft.sessionType}-${draft.id}`}
                className={'history-card history-card-draft'}
              >
                {draft.sessionType === 'PRACTICE' ? <BookOpenCheck /> : <ClipboardCheck />}
                <div>
                  <span className={'page-kicker'}>
                    {draft.sessionType === 'PRACTICE'
                      ? draft.practiceMode === 'REVIEW'
                        ? 'Ôn tập · đang làm dở'
                        : 'Luyện tập · đang làm dở'
                      : 'Bài kiểm tra · đang làm dở'}
                  </span>
                  <h2>{draft.title}</h2>
                  <time dateTime={draft.savedAt}>
                    Lưu lúc {new Date(draft.savedAt).toLocaleString('vi-VN')}
                  </time>
                  <p>
                    Đã làm {draft.answeredCount}/{draft.totalQuestions} câu
                    {draft.sessionType === 'PRACTICE' && draft.selectedLeafTypeIds.length > 0
                      ? ` · ${draft.selectedLeafTypeIds.slice(0, 3).join(', ')}`
                      : ''}
                  </p>
                </div>
                <strong className={'history-score history-draft-progress'}>
                  {draft.answeredCount}/{draft.totalQuestions}
                </strong>
                <Link className={'button button-primary'} to={draft.resumePath}>
                  <PlayCircle size={17} /> Làm tiếp
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {records.length === 0 && drafts.length === 0 ? (
        <div className={'empty-state'}>
          <h2>Chưa có lịch sử học</h2>
          <p>Bài đang làm dở hoặc kết quả đã hoàn thành sẽ xuất hiện tại đây.</p>
          <Link className={'button button-primary'} to={'/learn/types'}>
            Chọn dạng để luyện
          </Link>
        </div>
      ) : (
        records.length > 0 && (
          <section className={'history-completed-section'}>
            <div className={'history-section-title'}>
              <div>
                <BookOpenCheck size={20} />
                <h2>Đã hoàn thành</h2>
              </div>
              <span>{records.length} bài</span>
            </div>
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
          </section>
        )
      )}
    </PageContainer>
  );
}
