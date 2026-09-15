import type { LearningHistoryRecord } from '@math-app/shared';
import { BookOpenCheck, ClipboardCheck, Clock3, Database, PlayCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import {
  historyFileRepository,
  useHistoryFileStore,
} from '../features/progress/historyFileRepository';
import { inProgressSessionRepository } from '../features/progress/inProgressSessionRepository';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';
import { countDraftQuestionStates } from '../features/progress/sessionDraftSnapshot';

function completedAt(record: LearningHistoryRecord): string {
  return record.sessionType === 'PRACTICE' ? record.completedAt : record.submittedAt;
}

function draftProgressText(
  draft: ReturnType<typeof inProgressSessionRepository.list>[number],
): string {
  if (!draft.questionStates) return `Đã làm ${draft.answeredCount}/${draft.totalQuestions} câu`;

  const counts = countDraftQuestionStates(draft.questionStates);

  if (draft.sessionType === 'PRACTICE') {
    return `Hoàn thành ${counts.correct} · đang sai ${counts.wrong} · đang làm ${counts.working} · chưa làm ${counts.unanswered}`;
  }

  return `Đã trả lời ${counts.answered} · đang làm ${counts.working} · chưa trả lời ${counts.unanswered}`;
}

export function HistoryPage() {
  useHistoryFileStore();
  const [filter, setFilter] = useState<'ALL' | 'PRACTICE' | 'TEST'>('ALL');
  const drafts = inProgressSessionRepository
    .list()
    .filter((draft) => filter === 'ALL' || draft.sessionType === filter);
  const records = localLearningHistoryRepository
    .list()
    .filter((record) => filter === 'ALL' || record.sessionType === filter);

  const deleteDraft = (id: string) => {
    if (window.confirm('Xóa bài đang làm dở này?')) inProgressSessionRepository.remove(id);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('Xóa kết quả này khỏi lịch sử?')) localLearningHistoryRepository.delete(id);
  };

  const clearAll = () => {
    if (
      window.confirm('Xóa toàn bộ lịch sử và các bài đang làm dở? Thao tác này không thể hoàn tác.')
    )
      historyFileRepository.clearAll();
  };

  return (
    <PageContainer>
      <header className={'page-intro'}>
        <span className={'page-kicker'}>Lịch sử học</span>
        <h1>Bài đang làm dở và kết quả đã hoàn thành</h1>
        <p>Dữ liệu được lưu trong tệp của dự án nên có thể mang theo khi copy cả thư mục app.</p>
      </header>

      <div className={'history-storage-note'}>
        <div>
          <Database size={20} aria-hidden={'true'} />
          <span>
            Lưu tại <strong>data/history/history.json</strong>
          </span>
        </div>
        <button type={'button'} className={'history-clear-button'} onClick={clearAll}>
          <Trash2 size={17} /> Xóa toàn bộ lịch sử
        </button>
      </div>

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
                  <p>{draftProgressText(draft)}</p>
                  {draft.sessionType === 'PRACTICE' && draft.selectedLeafTypeIds.length > 0 && (
                    <p>{draft.selectedLeafTypeIds.slice(0, 3).join(', ')}</p>
                  )}
                </div>
                <strong className={'history-score history-draft-progress'}>
                  {draft.answeredCount}/{draft.totalQuestions}
                </strong>
                <div className={'history-card-actions'}>
                  <Link className={'button button-primary'} to={draft.resumePath}>
                    <PlayCircle size={17} /> Làm tiếp
                  </Link>
                  <button
                    type={'button'}
                    className={'history-delete-button'}
                    onClick={() => deleteDraft(draft.id)}
                    aria-label={`Xóa bài đang làm dở ${draft.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
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
                  <div className={'history-card-actions'}>
                    <Link className={'button button-secondary'} to={`/history/${record.id}`}>
                      Xem chi tiết
                    </Link>
                    <button
                      type={'button'}
                      className={'history-delete-button'}
                      onClick={() => deleteRecord(record.id)}
                      aria-label={'Xóa kết quả lịch sử'}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      )}
    </PageContainer>
  );
}
