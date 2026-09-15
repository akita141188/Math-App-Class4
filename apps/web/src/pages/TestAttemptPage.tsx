import type { StudentAnswer, TestHistoryRecord } from '@math-app/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  LoaderCircle,
  Star,
  Trophy,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTestAttempt, submitTestAttempt, updateTestAnswer } from '../api/client';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';
import { inProgressSessionRepository } from '../features/progress/inProgressSessionRepository';
import {
  buildTestQuestionStates,
  snapshotDraftQuestions,
} from '../features/progress/sessionDraftSnapshot';
import { useSessionExitGuard } from '../hooks/useSessionExitGuard';
import { AnswerInput } from '../features/question/AnswerInput';
import { QuestionVisualRendererV2 } from '../features/question/QuestionVisualRendererV2';

function answered(value: StudentAnswer | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return true;
  if ('kind' in value && value.kind === 'FRACTION')
    return (
      typeof value.numerator === 'number' &&
      value.numerator >= 0 &&
      typeof value.denominator === 'number' &&
      value.denominator > 0
    );
  return Object.values(value as Record<string, string>).some((item) => item.trim().length > 0);
}

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function TestAttemptPage({ reviewMode = false }: { reviewMode?: boolean }) {
  const { attemptId = '' } = useParams();
  const query = useQuery({
    queryKey: ['test-attempt', attemptId],
    queryFn: () => getTestAttempt(attemptId),
    retry: false,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [clockNow, setClockNow] = useState(() => Date.now());
  const restoredDraftRef = useRef(false);

  useEffect(() => {
    if (!query.data) return;

    const draft = inProgressSessionRepository.get(query.data.id);
    if (draft?.sessionType === 'TEST' && !restoredDraftRef.current) {
      setAnswers({ ...query.data.answers, ...draft.answers });
      setCurrentIndex(Math.min(draft.currentIndex, Math.max(0, query.data.questions.length - 1)));
      restoredDraftRef.current = true;
    } else {
      setAnswers(query.data.answers);
    }

    if (query.data.status === 'SUBMITTED') {
      inProgressSessionRepository.remove(query.data.id);
    }
  }, [query.data]);

  useEffect(() => {
    if (reviewMode) setCurrentIndex(0);
  }, [reviewMode]);

  useEffect(() => {
    if (query.data?.status !== 'IN_PROGRESS') return undefined;
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [query.data?.status]);

  const update = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: StudentAnswer }) =>
      updateTestAnswer(attemptId, questionId, answer),
  });

  const submit = useMutation({
    mutationFn: () => submitTestAttempt(attemptId, answers),
    onSuccess: (attempt) => {
      if (!attempt.result || !attempt.submittedAt) return;
      const record: TestHistoryRecord = {
        id: attempt.id,
        sessionType: 'TEST',
        testBlueprintId: attempt.blueprintId,
        testTitle: attempt.title,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        durationSeconds: attempt.result.durationSeconds,
        contentVersion: attempt.contentVersion,
        questionCount: attempt.questions.length,
        correctCount: attempt.result.rawCorrect,
        incorrectCount: attempt.result.rawIncorrect,
        unansweredCount: attempt.result.rawUnanswered,
        rawPercent: attempt.result.rawPercent,
        finalScore10: attempt.result.finalScore10,
        topicBreakdown: attempt.result.topicBreakdown,
        questionResults: attempt.questions.map((question) => {
          const result = attempt.result!.questionResults.find(
            (item) => item.questionId === question.id,
          )!;
          return {
            questionId: question.id,
            leafTypeId: question.problemTypeId,
            topicId: question.topicId,
            difficulty: question.difficulty,
            assessmentLevel: result.assessmentLevel,
            format: question.format,
            correct: result.correct,
            unanswered: result.unanswered,
            hintCount: 0,
            answeredAt: attempt.submittedAt,
            studentAnswer: result.studentAnswer,
            correctAnswerSummary: result.correctAnswerSummary,
            questionSummary: question.stem,
            explanation: result.explanation,
          };
        }),
      };
      localLearningHistoryRepository.save(record);
      inProgressSessionRepository.remove(attempt.id);
      void query.refetch();
    },
  });

  const attempt = submit.data ?? query.data;
  const draftAnsweredCount = attempt
    ? attempt.questions.filter((item) => answered(answers[item.id])).length
    : 0;

  const persistDraft = useCallback(() => {
    if (!attempt || reviewMode || attempt.status !== 'IN_PROGRESS') return;

    const questionStates = buildTestQuestionStates(attempt.questions, currentIndex, answers);

    inProgressSessionRepository.save({
      id: attempt.id,
      sessionType: 'TEST',
      title: attempt.title,
      startedAt: attempt.startedAt,
      savedAt: new Date().toISOString(),
      resumePath: `/tests/attempt/${encodeURIComponent(attempt.id)}`,
      currentIndex,
      totalQuestions: attempt.questions.length,
      answeredCount: draftAnsweredCount,
      testBlueprintId: attempt.blueprintId,
      answers,
      questions: snapshotDraftQuestions(attempt.questions),
      questionStates,
    });
  }, [answers, attempt, currentIndex, draftAnsweredCount, reviewMode]);

  useEffect(() => {
    if (!attempt || reviewMode || attempt.status !== 'IN_PROGRESS') return undefined;
    if (draftAnsweredCount === 0 && currentIndex === 0) return undefined;

    const timeout = window.setTimeout(persistDraft, 450);
    return () => window.clearTimeout(timeout);
  }, [attempt, currentIndex, draftAnsweredCount, persistDraft, reviewMode]);

  useSessionExitGuard({
    enabled: Boolean(attempt && !reviewMode && attempt.status === 'IN_PROGRESS'),
    message:
      'Em đang làm dở bài kiểm tra. Nếu thoát, bài sẽ được lưu vào Lịch sử để em có thể làm tiếp sau. Thoát bây giờ?',
    onConfirmedExit: persistDraft,
  });

  if (query.isLoading)
    return (
      <PageContainer>
        <div className={'catalog-loading'}>
          <LoaderCircle className={'spin'} /> Đang mở đề…
        </div>
      </PageContainer>
    );

  if (!attempt)
    return (
      <PageContainer>
        <div className={'empty-state'}>
          <h1>Không tìm thấy bài kiểm tra</h1>
          <Link className={'button button-secondary'} to={'/tests'}>
            Chọn đề khác
          </Link>
        </div>
      </PageContainer>
    );

  if (attempt.status === 'SUBMITTED' && !reviewMode) {
    const result = attempt.result!;
    return (
      <PageContainer>
        <section className={'test-result'}>
          <CheckCircle2 aria-hidden={'true'} />
          <span className={'page-kicker'}>Hoàn thành bài kiểm tra</span>
          <h1>Điểm: {result.finalScore10}/10</h1>
          <div className={'history-summary'}>
            <article>
              <strong>{result.rawCorrect}</strong>
              <span>Đúng</span>
            </article>
            <article>
              <strong>{result.rawIncorrect}</strong>
              <span>Sai</span>
            </article>
            <article>
              <strong>{result.rawUnanswered}</strong>
              <span>Bỏ trống</span>
            </article>
            <article>
              <strong>{result.rawPercent}%</strong>
              <span>Chính xác</span>
            </article>
            <article>
              <strong>{Math.max(1, Math.round(result.durationSeconds / 60))}</strong>
              <span>Phút</span>
            </article>
          </div>
          <section className={'topic-breakdown'} aria-labelledby={'topic-breakdown-title'}>
            <h2 id={'topic-breakdown-title'}>Kết quả theo chủ đề</h2>
            {result.topicBreakdown.map((topic) => (
              <p key={topic.topicId}>
                <span>{topic.topicName ?? topic.topicId.replaceAll('-', ' ')}</span>
                <strong>
                  {topic.correctCount}/{topic.questionCount}
                </strong>
              </p>
            ))}
          </section>
          <div className={'completion-actions'}>
            <Link className={'button button-primary'} to={`/tests/attempt/${attempt.id}/review`}>
              Xem lại bài
            </Link>
            <Link className={'button button-secondary'} to={'/tests'}>
              Làm bài khác
            </Link>
            <Link className={'button button-secondary'} to={'/'}>
              Về trang chủ
            </Link>
          </div>
        </section>
      </PageContainer>
    );
  }

  const question = attempt.questions[currentIndex]!;
  const reviewResult = attempt.result?.questionResults.find(
    (item) => item.questionId === question.id,
  );
  const unansweredCount = attempt.questions.filter((item) => !answered(answers[item.id])).length;
  const answeredCount = attempt.questions.length - unansweredCount;
  const elapsedSeconds =
    attempt.status === 'SUBMITTED'
      ? (attempt.result?.durationSeconds ?? 0)
      : Math.max(0, Math.floor((clockNow - Date.parse(attempt.startedAt)) / 1000));

  return (
    <PageContainer className={'test-attempt-page session-viewport-page'}>
      <div className={'session-topline'}>
        <Link className={'back-link'} to={attempt.status === 'SUBMITTED' ? '/history' : '/tests'}>
          <ArrowLeft size={18} /> Kết thúc
        </Link>
        <ProgressIndicator
          current={currentIndex + 1}
          total={attempt.questions.length}
          label={attempt.status === 'SUBMITTED' ? 'Xem lại bài' : 'Bài kiểm tra'}
        />
        <span className={'test-elapsed'}>Đã làm {formatElapsed(elapsedSeconds)}</span>
      </div>

      <div className={'test-layout session-three-column'}>
        <QuestionNavigator
          ariaLabel={'Danh sách câu hỏi kiểm tra'}
          currentIndex={currentIndex}
          total={attempt.questions.length}
          summary={`${answeredCount}/${attempt.questions.length} đã trả lời`}
          disabled={update.isPending || submit.isPending}
          stateForIndex={(index) =>
            answered(answers[attempt.questions[index]?.id ?? '']) ? 'done' : 'unanswered'
          }
          onSelect={setCurrentIndex}
        />

        <article className={'question-workspace test-workspace session-question-workspace'}>
          <span className={'page-kicker'}>Câu {currentIndex + 1}</span>
          <h1>{question.stem}</h1>
          {question.visual && <QuestionVisualRendererV2 visual={question.visual} />}
          <AnswerInput
            question={question}
            value={answers[question.id] ?? null}
            disabled={attempt.status === 'SUBMITTED'}
            onChange={(answer) => {
              setAnswers((current) => ({ ...current, [question.id]: answer }));
              update.mutate({ questionId: question.id, answer });
            }}
          />

          {attempt.status === 'SUBMITTED' && reviewResult && (
            <aside
              className={reviewResult.correct ? 'review-feedback correct' : 'review-feedback wrong'}
            >
              <strong>
                {reviewResult.unanswered ? 'Bỏ trống' : reviewResult.correct ? 'Đúng' : 'Sai'}
              </strong>
              <p>Đáp án đúng: {reviewResult.correctAnswerSummary}</p>
              <p>{reviewResult.explanation}</p>
            </aside>
          )}

          <div className={'practice-actions'}>
            <Button
              variant={'quiet'}
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}
            >
              <ArrowLeft size={18} /> Câu trước
            </Button>
            {currentIndex < attempt.questions.length - 1 ? (
              <Button onClick={() => setCurrentIndex((index) => index + 1)}>
                Câu tiếp theo <ArrowRight size={18} />
              </Button>
            ) : attempt.status === 'IN_PROGRESS' ? (
              <Button
                onClick={() => {
                  if (window.confirm(`Em còn ${unansweredCount} câu chưa trả lời. Nộp bài nhé?`))
                    submit.mutate();
                }}
                disabled={submit.isPending}
              >
                Nộp bài
              </Button>
            ) : null}
          </div>

          {attempt.status === 'IN_PROGRESS' && (
            <p className={'unanswered-note'}>
              Còn {unansweredCount} câu chưa trả lời. Có thể chuyển câu bằng menu bên trái; đáp án
              chỉ được chấm sau khi nộp bài.
            </p>
          )}
        </article>

        <aside
          className={'practice-companion test-attempt-companion'}
          aria-label={'Tiến trình bài kiểm tra'}
        >
          <div className={'companion-heading'}>
            <Trophy size={22} />
            <strong>Tiến trình bài kiểm tra</strong>
          </div>
          <div
            className={'companion-progress-ring'}
            style={
              {
                '--companion-progress': `${Math.round((answeredCount / attempt.questions.length) * 100)}%`,
              } as CSSProperties
            }
          >
            <strong>{answeredCount}</strong>
            <span>/ {attempt.questions.length}</span>
          </div>
          <div className={'companion-card'}>
            <Flame size={24} />
            <div>
              <strong>{answeredCount}</strong>
              <span>Câu đã trả lời</span>
            </div>
          </div>
          <div className={'companion-card companion-topic'}>
            <BookOpen size={24} />
            <div>
              <span>Chủ đề câu hiện tại</span>
              <strong>{question.topicId.replaceAll('-', ' ')}</strong>
            </div>
          </div>
          <div className={'companion-encouragement'}>
            <Star size={22} />
            <strong>Có thể chọn câu bất kỳ ở menu bên trái.</strong>
          </div>
          <img
            className={'practice-companion-art'}
            src={'/assets/redesign/practice-hero.webp'}
            alt={''}
            aria-hidden={'true'}
          />
        </aside>
      </div>
    </PageContainer>
  );
}
