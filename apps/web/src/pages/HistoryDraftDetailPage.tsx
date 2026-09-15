import type {
  HistoryDraftQuestionSnapshot,
  HistoryDraftQuestionState,
  InProgressSessionDraft,
  StudentAnswer,
} from '@math-app/shared';
import { ArrowLeft, BookOpenCheck, ClipboardCheck, PlayCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { useHistoryFileStore } from '../features/progress/historyFileRepository';
import {
  countDraftQuestionStates,
  hasStoredAnswer,
} from '../features/progress/sessionDraftSnapshot';

function stateLabel(
  state: HistoryDraftQuestionState,
  sessionType: InProgressSessionDraft['sessionType'],
) {
  if (state === 'CORRECT') return 'Hoàn thành';
  if (state === 'WRONG') return 'Đang sai';
  if (state === 'ANSWERED') return 'Đã trả lời';
  if (state === 'WORKING') return 'Đang làm';
  return sessionType === 'TEST' ? 'Chưa trả lời' : 'Chưa làm';
}

function stateClass(state: HistoryDraftQuestionState): string {
  if (state === 'CORRECT') return 'review-correct';
  if (state === 'WRONG') return 'review-wrong';
  if (state === 'ANSWERED') return 'review-answered';
  if (state === 'WORKING') return 'review-working';
  return 'review-unanswered';
}

function formatAnswer(answer: StudentAnswer | undefined): string {
  if (answer === undefined) return 'Chưa nhập';
  if (typeof answer === 'string') return answer || 'Chưa nhập';
  if (Array.isArray(answer)) return answer.join(', ');
  if (typeof answer === 'boolean') return answer ? 'Đúng' : 'Sai';

  if ('kind' in answer && answer.kind === 'FRACTION') {
    return `${answer.numerator}/${answer.denominator}`;
  }

  return Object.entries(answer)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ');
}

function legacyQuestions(draft: InProgressSessionDraft): HistoryDraftQuestionSnapshot[] {
  if (draft.sessionType === 'PRACTICE') {
    return draft.results.map((result) => ({
      questionId: result.questionId,
      questionSummary: result.questionSummary,
      leafTypeId: result.leafTypeId,
      topicId: result.topicId,
      difficulty: result.difficulty,
      assessmentLevel: result.assessmentLevel,
      format: result.format,
    }));
  }

  return Object.keys(draft.answers).map((questionId, index) => ({
    questionId,
    questionSummary: `Câu đã trả lời ${index + 1}`,
    leafTypeId: 'test-question',
    topicId: 'test',
    difficulty: 'MEDIUM',
    format: 'SHORT_ANSWER',
  }));
}

function legacyState(draft: InProgressSessionDraft, questionId: string): HistoryDraftQuestionState {
  if (draft.sessionType === 'PRACTICE') {
    const result = draft.results.find((item) => item.questionId === questionId);
    if (result) return result.correct ? 'CORRECT' : 'WRONG';
  }

  return hasStoredAnswer(draft.answers[questionId]) ? 'ANSWERED' : 'UNANSWERED';
}

export function HistoryDraftDetailPage() {
  const { draftId = '' } = useParams();
  const store = useHistoryFileStore();
  const draft = store.inProgress.find((item) => item.id === draftId);

  if (!draft) {
    return (
      <PageContainer>
        <div className={'empty-state'}>
          <h1>Không tìm thấy bài đang làm dở</h1>
          <Link className={'button button-secondary'} to={'/history'}>
            Về lịch sử
          </Link>
        </div>
      </PageContainer>
    );
  }

  const questions = draft.questions?.length ? draft.questions : legacyQuestions(draft);
  const states =
    draft.questionStates ??
    Object.fromEntries(
      questions.map((question) => [question.questionId, legacyState(draft, question.questionId)]),
    );
  const counts = countDraftQuestionStates(states);

  return (
    <PageContainer>
      <Link className={'back-link'} to={'/history'}>
        <ArrowLeft size={18} /> Lịch sử học
      </Link>

      <header className={'page-intro history-draft-detail-header'}>
        <span className={'page-kicker'}>
          {draft.sessionType === 'PRACTICE' ? 'Luyện tập đang làm dở' : 'Bài kiểm tra đang làm dở'}
        </span>
        <h1>{draft.title}</h1>
        <p>
          Bắt đầu {new Date(draft.startedAt).toLocaleString('vi-VN')} · lưu gần nhất{' '}
          {new Date(draft.savedAt).toLocaleString('vi-VN')}
        </p>
      </header>

      <div className={'history-summary'}>
        <article>
          <strong>{draft.totalQuestions}</strong>
          <span>Số câu</span>
        </article>

        {draft.sessionType === 'PRACTICE' ? (
          <>
            <article>
              <strong>{counts.correct}</strong>
              <span>Hoàn thành</span>
            </article>
            <article>
              <strong>{counts.wrong}</strong>
              <span>Đang sai</span>
            </article>
          </>
        ) : (
          <article>
            <strong>{counts.answered}</strong>
            <span>Đã trả lời</span>
          </article>
        )}

        <article>
          <strong>{counts.working}</strong>
          <span>Đang làm</span>
        </article>
        <article>
          <strong>
            {Math.max(
              0,
              draft.totalQuestions -
                counts.correct -
                counts.wrong -
                counts.answered -
                counts.working,
            )}
          </strong>
          <span>{draft.sessionType === 'TEST' ? 'Chưa trả lời' : 'Chưa làm'}</span>
        </article>
      </div>

      <div className={'history-draft-detail-actions'}>
        <Link className={'button button-primary'} to={draft.resumePath}>
          <PlayCircle size={17} /> Làm tiếp
        </Link>
      </div>

      <section className={'history-review history-draft-review'}>
        <h2>Trạng thái từng câu đã được lưu</h2>

        {questions.length === 0 ? (
          <div className={'history-draft-legacy-note'}>
            Bản ghi này được tạo trước bản cập nhật lưu chi tiết từng câu. Hãy mở bài và thoát lại
            một lần để cập nhật đầy đủ trạng thái.
          </div>
        ) : (
          questions.map((question, index) => {
            const state = states[question.questionId] ?? 'UNANSWERED';
            const result =
              draft.sessionType === 'PRACTICE'
                ? draft.results.find((item) => item.questionId === question.questionId)
                : undefined;
            const answer = draft.answers[question.questionId];

            return (
              <details
                key={question.questionId}
                className={stateClass(state)}
                open={state === 'WORKING'}
              >
                <summary>
                  Câu {index + 1} — {stateLabel(state, draft.sessionType)}
                </summary>

                <p>{question.questionSummary}</p>

                {hasStoredAnswer(answer) && (
                  <p>
                    <strong>Em đã nhập:</strong> {formatAnswer(answer)}
                  </p>
                )}

                {draft.sessionType === 'PRACTICE' && result?.correctAnswerSummary && (
                  <p>
                    <strong>Đáp án đúng:</strong> {result.correctAnswerSummary}
                  </p>
                )}

                {draft.sessionType === 'PRACTICE' && result?.explanation && (
                  <p>{result.explanation}</p>
                )}

                <small>
                  {question.leafTypeId} · {question.difficulty}
                </small>
              </details>
            );
          })
        )}
      </section>

      {draft.sessionType === 'TEST' && (
        <p className={'history-draft-test-note'}>
          Bài kiểm tra đang làm dở chỉ lưu câu đã trả lời/đang làm. Đúng hoặc sai chỉ được chấm sau
          khi nộp bài để không làm lộ đáp án trong lúc kiểm tra.
        </p>
      )}

      <div className={'history-draft-type-badge'} aria-hidden={'true'}>
        {draft.sessionType === 'PRACTICE' ? <BookOpenCheck /> : <ClipboardCheck />}
      </div>
    </PageContainer>
  );
}
