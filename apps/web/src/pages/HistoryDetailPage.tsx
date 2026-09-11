import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';

export function HistoryDetailPage() {
  const { historyId = '' } = useParams();
  const record = localLearningHistoryRepository.get(historyId);
  if (!record)
    return (
      <PageContainer>
        <div className={'empty-state'}>
          <h1>Không tìm thấy kết quả này</h1>
          <Link className={'button button-secondary'} to={'/history'}>
            Về lịch sử
          </Link>
        </div>
      </PageContainer>
    );
  const endedAt = record.sessionType === 'PRACTICE' ? record.completedAt : record.submittedAt;
  const percent = record.sessionType === 'PRACTICE' ? record.accuracyPercent : record.rawPercent;
  return (
    <PageContainer>
      <Link className={'back-link'} to={'/history'}>
        <ArrowLeft size={18} /> Lịch sử học
      </Link>
      <header className={'page-intro'}>
        <span className={'page-kicker'}>
          {record.sessionType === 'PRACTICE' ? 'Chi tiết luyện tập' : 'Kết quả kiểm tra'}
        </span>
        <h1>{record.sessionType === 'PRACTICE' ? 'Buổi luyện đã hoàn thành' : record.testTitle}</h1>
        <p>
          Hoàn thành lúc {new Date(endedAt).toLocaleString('vi-VN')} ·{' '}
          {Math.max(1, Math.round(record.durationSeconds / 60))} phút
        </p>
      </header>
      <div className={'history-summary'}>
        {record.sessionType === 'TEST' && (
          <article>
            <strong>{record.finalScore10}/10</strong>
            <span>Điểm</span>
          </article>
        )}
        <article>
          <strong>{record.questionResults.length}</strong>
          <span>Số câu</span>
        </article>
        <article>
          <strong>{record.correctCount}</strong>
          <span>Đúng</span>
        </article>
        <article>
          <strong>{record.incorrectCount}</strong>
          <span>Sai</span>
        </article>
        <article>
          <strong>{record.unansweredCount}</strong>
          <span>Bỏ qua</span>
        </article>
        <article>
          <strong>{percent}%</strong>
          <span>Chính xác</span>
        </article>
      </div>
      <section className={'history-review'}>
        <h2>Xem lại từng câu</h2>
        {record.questionResults.map((result, index) => (
          <details
            key={result.questionId}
            className={result.correct ? 'review-correct' : 'review-wrong'}
          >
            <summary>
              Câu {index + 1} — {result.unanswered ? 'Bỏ qua' : result.correct ? 'Đúng' : 'Sai'}
            </summary>
            <p>{result.questionSummary}</p>
            {result.studentAnswer !== undefined && (
              <p>
                <strong>Em trả lời:</strong>{' '}
                {typeof result.studentAnswer === 'object'
                  ? JSON.stringify(result.studentAnswer)
                  : String(result.studentAnswer)}
              </p>
            )}
            {result.correctAnswerSummary && (
              <p>
                <strong>Đáp án đúng:</strong> {result.correctAnswerSummary}
              </p>
            )}
            {result.explanation && <p>{result.explanation}</p>}
            <small>
              {result.leafTypeId} · {result.difficulty}
            </small>
          </details>
        ))}
      </section>
    </PageContainer>
  );
}
