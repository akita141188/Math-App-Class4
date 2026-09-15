import type {
  FractionAnswer,
  PracticeHistoryRecord,
  PracticeMode,
  StoredQuestionResult,
  StudentAnswer,
  StudentQuestion,
  SubmitPracticeAnswerResponse,
} from '@math-app/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Flame,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Star,
  Trophy,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPracticeSession, getPracticeSession, submitPracticeAnswer } from '../api/client';
import { Button } from '../components/Button';
import { FeedbackState } from '../components/FeedbackState';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';
import { localProgressRepository } from '../features/progress/progressRepository';
import { localQuestionHistoryRepository } from '../features/progress/questionHistoryRepository';
import { inProgressSessionRepository } from '../features/progress/inProgressSessionRepository';
import {
  buildPracticeQuestionStates,
  hasStoredAnswer,
  snapshotDraftQuestions,
} from '../features/progress/sessionDraftSnapshot';
import { useSessionExitGuard } from '../hooks/useSessionExitGuard';
import { AnswerInput } from '../features/question/AnswerInput';
import { QuestionVisualRendererV2 } from '../features/question/QuestionVisualRendererV2';

function isFractionAnswer(answer: StudentAnswer): answer is FractionAnswer {
  if (typeof answer !== 'object' || Array.isArray(answer) || answer === null) return false;
  const candidate = answer as Partial<FractionAnswer>;
  return (
    candidate.kind === 'FRACTION' &&
    typeof candidate.numerator === 'number' &&
    typeof candidate.denominator === 'number'
  );
}

function hasAnswer(answer: StudentAnswer | null, question: StudentQuestion): boolean {
  if (question.format === 'ORDERING') return Boolean(question.orderingItems?.length);
  if (answer === null) return false;
  if (typeof answer === 'string') return answer.trim().length > 0;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'boolean') return true;
  if (isFractionAnswer(answer)) {
    return answer.numerator >= 0 && answer.denominator >= 2;
  }
  return Object.values(answer).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}

function submittedAnswer(answer: StudentAnswer | null, question: StudentQuestion): StudentAnswer {
  if (answer !== null) return answer;
  if (question.format === 'ORDERING') return question.orderingItems?.map((item) => item.id) ?? [];
  return '';
}

function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

function recentQuestionsForRequest(
  problemTypeIds: readonly string[],
  requestedCount: number | 'ALL',
) {
  if (requestedCount === 'ALL') return [];

  // A previous 1,000-question session can leave ~1,000 history references in localStorage.
  // Sending all of them can exceed Express' default JSON body limit. Keep a broad,
  // recent window for rotation while bounding the request payload.
  return localQuestionHistoryRepository
    .getRecent(problemTypeIds)
    .sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt))
    .slice(0, 300);
}

export function PracticeSessionPage() {
  const [searchParams] = useSearchParams();
  const problemTypeIds = (searchParams.get('types') ?? 'multiply-one-digit')
    .split(',')
    .filter(Boolean);
  const difficulty = searchParams.get('difficulty') as 'EASY' | 'MEDIUM' | 'HARD' | 'ALL' | null;
  const mode = (searchParams.get('mode') ?? 'PRACTICE') as PracticeMode;
  const countParam = searchParams.get('count') ?? '5';
  const requestedCount =
    countParam === 'ALL' ? 'ALL' : Math.min(50, Math.max(1, Number(countParam)));
  const runSeed = searchParams.get('run') ?? undefined;
  const resumeSessionId = searchParams.get('resume') ?? undefined;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
  const [responses, setResponses] = useState<Record<string, SubmitPracticeAnswerResponse>>({});
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(() => new Set());
  const [attemptedQuestionIds, setAttemptedQuestionIds] = useState<Set<string>>(() => new Set());
  const resultsRef = useRef(new Map<string, StoredQuestionResult>());
  const restoredDraftRef = useRef(false);

  const sessionQuery = useQuery({
    queryKey: [
      'practice-session',
      resumeSessionId ?? 'new',
      problemTypeIds.join(','),
      difficulty,
      mode,
      requestedCount,
      runSeed,
    ],
    queryFn: () =>
      resumeSessionId
        ? getPracticeSession(resumeSessionId)
        : createPracticeSession({
            grade: 4,
            problemTypeIds,
            difficulty: difficulty ?? undefined,
            questionCount: requestedCount,
            mode,
            recentQuestions: recentQuestionsForRequest(problemTypeIds, requestedCount),
            randomSeed: runSeed,
          }),
    staleTime: Infinity,
    retry: false,
  });

  const session = sessionQuery.data;
  const question = session?.questions[currentIndex];
  const answer = question ? (answers[question.id] ?? null) : null;
  const hintCount = question ? (hintLevels[question.id] ?? 0) : 0;
  const lastResult = question ? (responses[question.id] ?? null) : null;

  useEffect(() => {
    if (!session) return;

    if (!resumeSessionId) {
      localQuestionHistoryRepository.record(session.questions, session.startedAt);
    }

    setSolvedQuestionIds(
      new Set(
        session.attempts.filter((attempt) => attempt.correct).map((attempt) => attempt.questionId),
      ),
    );
    setAttemptedQuestionIds(new Set(session.attempts.map((attempt) => attempt.questionId)));

    if (resumeSessionId && !restoredDraftRef.current) {
      const draft = inProgressSessionRepository.get(session.id);
      if (draft?.sessionType === 'PRACTICE') {
        setCurrentIndex(Math.min(draft.currentIndex, Math.max(0, session.questionCount - 1)));
        setAnswers(draft.answers);
        setHintLevels(draft.hintLevels);
        resultsRef.current = new Map(draft.results.map((result) => [result.questionId, result]));
        if (draft.questionStates && Object.keys(draft.questionStates).length > 0) {
          const entries = Object.entries(draft.questionStates);
          setSolvedQuestionIds(
            new Set(entries.filter(([, state]) => state === 'CORRECT').map(([id]) => id)),
          );
          setAttemptedQuestionIds(
            new Set(
              entries
                .filter(([, state]) => state === 'CORRECT' || state === 'WRONG')
                .map(([id]) => id),
            ),
          );
        }
      }
      restoredDraftRef.current = true;
    }
  }, [resumeSessionId, session]);

  const answerMutation = useMutation({
    mutationFn: ({
      sessionId,
      activeQuestion,
      submitted,
      usedHints,
    }: {
      sessionId: string;
      activeQuestion: StudentQuestion;
      submitted: StudentAnswer;
      usedHints: number;
    }) =>
      submitPracticeAnswer(sessionId, {
        questionId: activeQuestion.id,
        answer: submitted,
        hintCount: usedHints,
      }),
    onSuccess: (response, variables) => {
      const activeQuestion = variables.activeQuestion;
      setAttemptedQuestionIds((current) => new Set(current).add(activeQuestion.id));

      localProgressRepository.recordAttempt(
        activeQuestion.skillId,
        response.result,
        variables.usedHints,
      );

      const prior = resultsRef.current.get(activeQuestion.id);
      const storedResult: StoredQuestionResult = {
        questionId: activeQuestion.id,
        leafTypeId: activeQuestion.problemTypeId,
        topicId: activeQuestion.topicId,
        difficulty: activeQuestion.difficulty,
        assessmentLevel: activeQuestion.assessmentLevel,
        format: activeQuestion.format,
        correct: response.result.correct && prior?.correct !== false,
        unanswered: false,
        hintCount: Math.max(variables.usedHints, prior?.hintCount ?? 0),
        answeredAt: new Date().toISOString(),
        studentAnswer: variables.submitted,
        correctAnswerSummary: response.correctAnswerSummary,
        questionSummary: activeQuestion.stem,
        explanation: response.result.explanation,
      };
      resultsRef.current.set(activeQuestion.id, storedResult);

      if (response.result.correct) {
        setSolvedQuestionIds((current) => new Set(current).add(activeQuestion.id));
      }
      setResponses((current) => ({ ...current, [activeQuestion.id]: response }));

      if (response.completed && session) {
        inProgressSessionRepository.remove(session.id);
        const completedAt = new Date().toISOString();
        const questionResults = session.questions.map(
          (item): StoredQuestionResult =>
            resultsRef.current.get(item.id) ?? {
              questionId: item.id,
              leafTypeId: item.problemTypeId,
              topicId: item.topicId,
              difficulty: item.difficulty,
              assessmentLevel: item.assessmentLevel,
              format: item.format,
              correct: false,
              unanswered: true,
              hintCount: 0,
              questionSummary: item.stem,
            },
        );
        const correctCount = questionResults.filter((item) => item.correct).length;
        const history: PracticeHistoryRecord = {
          id: session.id,
          sessionType: 'PRACTICE',
          practiceMode: session.mode,
          startedAt: session.startedAt,
          completedAt,
          durationSeconds: Math.max(
            0,
            Math.round((Date.parse(completedAt) - Date.parse(session.startedAt)) / 1000),
          ),
          contentVersion: session.contentVersion,
          selectedDomainIds: [...new Set(session.questions.map((item) => item.domainId))],
          selectedTopicIds: session.selectedTopicIds,
          selectedLeafTypeIds: session.selectedProblemTypes,
          difficultyMode: session.difficulty ?? 'ALL',
          requestedQuestionCount: session.requestedQuestionCount,
          actualQuestionCount: session.questionCount,
          correctCount,
          incorrectCount: questionResults.filter((item) => !item.correct && !item.unanswered)
            .length,
          unansweredCount: questionResults.filter((item) => item.unanswered).length,
          accuracyPercent: Math.round((correctCount / session.questionCount) * 100),
          questionResults,
        };
        localLearningHistoryRepository.save(history);
      }
    },
  });

  const solvedCount = solvedQuestionIds.size;

  const persistDraft = useCallback(() => {
    if (!session || session.completed || lastResult?.completed) return;

    const practiceLabel =
      session.mode === 'REVIEW'
        ? 'Ôn tập đang làm dở'
        : session.mode === 'LEARN'
          ? 'Học có gợi ý đang làm dở'
          : 'Luyện tập đang làm dở';

    const questionStates = buildPracticeQuestionStates(
      session.questions,
      currentIndex,
      answers,
      solvedQuestionIds,
      attemptedQuestionIds,
    );
    const answeredCount = Object.values(questionStates).filter(
      (state) => state === 'CORRECT' || state === 'WRONG',
    ).length;

    inProgressSessionRepository.save({
      id: session.id,
      sessionType: 'PRACTICE',
      title: practiceLabel,
      startedAt: session.startedAt,
      savedAt: new Date().toISOString(),
      resumePath: `/practice?resume=${encodeURIComponent(session.id)}`,
      currentIndex,
      totalQuestions: session.questionCount,
      answeredCount,
      practiceMode: session.mode,
      selectedLeafTypeIds: session.selectedProblemTypes,
      answers,
      hintLevels,
      results: [...resultsRef.current.values()],
      questions: snapshotDraftQuestions(session.questions),
      questionStates,
    });
  }, [
    answers,
    attemptedQuestionIds,
    currentIndex,
    hintLevels,
    lastResult,
    session,
    solvedQuestionIds,
  ]);

  useEffect(() => {
    const hasProgress =
      attemptedQuestionIds.size > 0 ||
      currentIndex > 0 ||
      Object.values(hintLevels).some((level) => level > 0) ||
      Object.values(answers).some((value) => hasStoredAnswer(value));

    if (!hasProgress) return undefined;

    const timeout = window.setTimeout(persistDraft, 450);
    return () => window.clearTimeout(timeout);
  }, [answers, attemptedQuestionIds, currentIndex, hintLevels, persistDraft]);

  useSessionExitGuard({
    enabled: Boolean(session && !session.completed && !lastResult?.completed),
    message:
      'Em đang làm dở. Nếu thoát, bài sẽ được lưu vào Lịch sử để em có thể làm tiếp sau. Thoát bây giờ?',
    onConfirmedExit: persistDraft,
  });

  if (sessionQuery.isLoading) {
    return (
      <PageContainer>
        <div className={'catalog-loading'} role={'status'}>
          <LoaderCircle className={'spin'} /> Đang chuẩn bị bộ câu hỏi…
        </div>
      </PageContainer>
    );
  }

  if (!session || !question) {
    return (
      <PageContainer>
        <div className={'empty-state'}>
          <h1>
            {resumeSessionId ? 'Chưa thể mở lại bài đang làm dở' : 'Chưa tạo được phiên luyện tập'}
          </h1>
          <p>
            {resumeSessionId
              ? 'Phiên này không còn trên máy chủ hiện tại. Em có thể quay lại Lịch sử hoặc chọn một bộ mới.'
              : sessionQuery.error instanceof Error
                ? sessionQuery.error.message
                : 'Hãy chọn lại dạng Toán hoặc mức độ khác.'}
          </p>
          <Link
            className={'button button-secondary'}
            to={resumeSessionId ? '/history' : '/learn/types'}
          >
            {resumeSessionId ? 'Về lịch sử' : 'Chọn dạng Toán'}
          </Link>
        </div>
      </PageContainer>
    );
  }

  if (lastResult?.completed) {
    const completed = localLearningHistoryRepository.get(session.id);
    const correctCount =
      completed?.sessionType === 'PRACTICE' ? completed.correctCount : lastResult.correctCount;
    const incorrectCount =
      completed?.sessionType === 'PRACTICE'
        ? completed.incorrectCount
        : session.questionCount - correctCount;
    const accuracy = Math.round((correctCount / session.questionCount) * 100);
    const similarParams = new URLSearchParams();
    similarParams.set('types', session.selectedProblemTypes.join(','));
    similarParams.set('difficulty', session.difficulty ?? 'ALL');
    similarParams.set('mode', session.mode);
    similarParams.set('count', String(session.requestedQuestionCount));
    similarParams.set('run', `${Date.now()}`);

    return (
      <PageContainer>
        <section className={'practice-complete'}>
          <Trophy aria-hidden={'true'} />
          <span className={'page-kicker'}>Hoàn thành</span>
          <h1>Em đã đi hết bộ câu hỏi!</h1>
          <p>
            Em làm đúng {correctCount}/{session.questionCount} câu · {incorrectCount} câu cần xem
            lại · {accuracy}% chính xác.
          </p>
          <div className={'completion-actions'}>
            <Link className={'button button-primary'} to={`/practice?${similarParams.toString()}`}>
              <RotateCcw size={18} /> Luyện bộ tương tự
            </Link>
            <Link className={'button button-secondary'} to={`/history/${session.id}`}>
              Xem câu sai
            </Link>
            <Link className={'button button-secondary'} to={'/history'}>
              Xem lịch sử
            </Link>
            <Link className={'button button-secondary'} to={'/learn/types'}>
              Chọn dạng khác
            </Link>
          </div>
        </section>
      </PageContainer>
    );
  }

  const showHint = () => {
    setHintLevels((current) => ({
      ...current,
      [question.id]: Math.min(question.hints.length, (current[question.id] ?? 0) + 1),
    }));
  };

  const goToQuestion = (index: number) => {
    if (answerMutation.isPending || index < 0 || index >= session.questions.length) return;
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    if (!lastResult?.result.correct) return;

    for (let offset = 1; offset <= session.questions.length; offset += 1) {
      const index = (currentIndex + offset) % session.questions.length;
      const candidate = session.questions[index];
      if (candidate && !solvedQuestionIds.has(candidate.id)) {
        setCurrentIndex(index);
        return;
      }
    }
  };

  return (
    <PageContainer className={'practice-page session-viewport-page'}>
      <div className={'session-topline'}>
        <Link className={'back-link'} to={'/learn/types'}>
          <ArrowLeft size={18} /> Kết thúc
        </Link>
        <ProgressIndicator
          current={currentIndex + 1}
          total={session.questionCount}
          label={
            session.mode === 'LEARN'
              ? 'Học có gợi ý'
              : session.mode === 'REVIEW'
                ? 'Ôn phần còn yếu'
                : 'Tự luyện'
          }
        />
      </div>

      <div className={'practice-stage session-three-column'}>
        <QuestionNavigator
          ariaLabel={'Danh sách câu luyện tập'}
          currentIndex={currentIndex}
          total={session.questionCount}
          summary={`${solvedCount}/${session.questionCount} đã hoàn thành`}
          disabled={answerMutation.isPending}
          stateForIndex={(index) => {
            const item = session.questions[index];
            if (!item) return 'unanswered';
            if (solvedQuestionIds.has(item.id)) return 'done';
            if (
              attemptedQuestionIds.has(item.id) ||
              (Object.hasOwn(answers, item.id) && hasAnswer(answers[item.id] ?? null, item)) ||
              (hintLevels[item.id] ?? 0) > 0
            )
              return 'working';
            return 'unanswered';
          }}
          onSelect={goToQuestion}
        />

        <article className={'question-workspace session-question-workspace'}>
          <header>
            <div>
              <span className={'page-kicker'}>Câu {currentIndex + 1}</span>
              <span
                className={`difficulty-badge difficulty-${question.difficulty.toLowerCase()}`}
                aria-label={`Mức độ ${question.difficulty === 'EASY' ? 'Dễ' : question.difficulty === 'MEDIUM' ? 'Vừa sức' : 'Nâng cao'}`}
              >
                {question.difficulty === 'EASY'
                  ? 'Dễ'
                  : question.difficulty === 'MEDIUM'
                    ? 'Vừa sức'
                    : 'Nâng cao'}
              </span>
            </div>
            <h1>{question.stem}</h1>
          </header>

          {question.visual && <QuestionVisualRendererV2 visual={question.visual} />}

          <AnswerInput
            question={question}
            value={answer}
            onChange={(value) => {
              setAnswers((current) => ({ ...current, [question.id]: value }));
              setResponses((current) => withoutKey(current, question.id));
            }}
            disabled={answerMutation.isPending || solvedQuestionIds.has(question.id)}
          />

          {hintCount > 0 && (
            <aside className={'hint-panel'} aria-live={'polite'}>
              <strong>
                <Lightbulb size={19} /> Gợi ý {hintCount}
              </strong>
              {question.hints.slice(0, hintCount).map((hint) => (
                <p key={hint.level}>{hint.text}</p>
              ))}
            </aside>
          )}

          {lastResult && (
            <>
              <FeedbackState kind={lastResult.result.correct ? 'success' : 'retry'}>
                {lastResult.result.feedback}
              </FeedbackState>
              {lastResult.result.explanation && (
                <p className={'answer-explanation'}>{lastResult.result.explanation}</p>
              )}
            </>
          )}

          {answerMutation.isError && (
            <FeedbackState kind={'retry'}>
              {answerMutation.error instanceof Error
                ? answerMutation.error.message
                : 'Chưa gửi được câu trả lời. Em thử lại nhé.'}
            </FeedbackState>
          )}

          <div className={'practice-actions'}>
            {!solvedQuestionIds.has(question.id) && (
              <Button
                variant={'quiet'}
                onClick={showHint}
                disabled={hintCount >= question.hints.length}
              >
                <Lightbulb size={19} /> Gợi ý từng bước
              </Button>
            )}

            {solvedQuestionIds.has(question.id) ? (
              <Button onClick={nextQuestion}>
                Câu tiếp theo <ArrowRight size={19} />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const submitted = submittedAnswer(answer, question);
                  answerMutation.mutate({
                    sessionId: session.id,
                    activeQuestion: question,
                    submitted,
                    usedHints: hintCount,
                  });
                }}
                disabled={!hasAnswer(answer, question) || answerMutation.isPending}
              >
                {answerMutation.isPending && <LoaderCircle className={'spin'} size={19} />} Kiểm tra
              </Button>
            )}
          </div>
        </article>

        <aside className={'practice-companion'} aria-label={'Tiến trình luyện tập'}>
          <div className={'companion-heading'}>
            <Trophy size={22} />
            <strong>Tiến trình bài tập</strong>
          </div>
          <div
            className={'companion-progress-ring'}
            style={
              {
                '--companion-progress': `${Math.round((solvedCount / session.questionCount) * 100)}%`,
              } as CSSProperties
            }
          >
            <strong>{solvedCount}</strong>
            <span>/ {session.questionCount}</span>
          </div>
          <div className={'companion-card'}>
            <Flame size={24} />
            <div>
              <strong>{solvedCount}</strong>
              <span>Câu đã hoàn thành</span>
            </div>
          </div>
          <div className={'companion-card companion-topic'}>
            <BookOpen size={24} />
            <div>
              <span>Dạng bài hiện tại</span>
              <strong>{question.problemTypeId.replaceAll('-', ' ')}</strong>
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
