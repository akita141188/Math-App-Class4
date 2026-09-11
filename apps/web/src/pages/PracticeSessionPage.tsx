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
import { useEffect, useReducer, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPracticeSession, submitPracticeAnswer } from '../api/client';
import { Button } from '../components/Button';
import { FeedbackState } from '../components/FeedbackState';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { AnswerInput } from '../features/question/AnswerInput';
import { QuestionVisualRendererV2 } from '../features/question/QuestionVisualRendererV2';
import {
  initialPracticeFlow,
  practiceFlowReducer,
} from '../features/learning-session/practiceFlowReducer';
import { localProgressRepository } from '../features/progress/progressRepository';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';
import { localQuestionHistoryRepository } from '../features/progress/questionHistoryRepository';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState<StudentAnswer | null>(null);
  const [flow, dispatch] = useReducer(practiceFlowReducer, initialPracticeFlow);
  const hintCount = flow.hintLevel;
  const [lastResult, setLastResult] = useState<SubmitPracticeAnswerResponse | null>(null);
  const resultsRef = useRef(new Map<string, StoredQuestionResult>());

  const sessionQuery = useQuery({
    queryKey: [
      'practice-session',
      problemTypeIds.join(','),
      difficulty,
      mode,
      requestedCount,
      runSeed,
    ],
    queryFn: () =>
      createPracticeSession({
        grade: 4,
        problemTypeIds,
        difficulty: difficulty ?? undefined,
        questionCount: requestedCount,
        mode,
        recentQuestions: localQuestionHistoryRepository.getRecent(problemTypeIds),
        randomSeed: runSeed,
      }),
    staleTime: Infinity,
    retry: false,
  });
  const session = sessionQuery.data;
  const question = session?.questions[currentIndex];

  useEffect(() => {
    if (session) localQuestionHistoryRepository.record(session.questions, session.startedAt);
  }, [session]);

  const answerMutation = useMutation({
    mutationFn: ({
      sessionId,
      question: activeQuestion,
    }: {
      sessionId: string;
      question: StudentQuestion;
    }) =>
      submitPracticeAnswer(sessionId, {
        questionId: activeQuestion.id,
        answer: submittedAnswer(answer, activeQuestion),
        hintCount,
      }),
    onSuccess: (response) => {
      if (!question) return;
      localProgressRepository.recordAttempt(question.skillId, response.result, hintCount);
      const prior = resultsRef.current.get(question.id);
      const storedResult: StoredQuestionResult = {
        questionId: question.id,
        leafTypeId: question.problemTypeId,
        topicId: question.topicId,
        difficulty: question.difficulty,
        assessmentLevel: question.assessmentLevel,
        format: question.format,
        correct: response.result.correct && prior?.correct !== false,
        unanswered: false,
        hintCount: Math.max(hintCount, prior?.hintCount ?? 0),
        answeredAt: new Date().toISOString(),
        studentAnswer: submittedAnswer(answer, question),
        correctAnswerSummary: response.correctAnswerSummary,
        questionSummary: question.stem,
        explanation: response.result.explanation,
      };
      resultsRef.current.set(question.id, storedResult);
      if (response.completed && session) {
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
      setLastResult(response);
      dispatch({
        type: 'ANSWER_RESULT',
        correct: response.result.correct,
        completed: response.completed,
      });
    },
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
          <h1>Chưa tạo được phiên luyện tập</h1>
          <p>Hãy chọn lại dạng Toán hoặc mức độ khác.</p>
          <Link className={'button button-secondary'} to={'/learn/types'}>
            Chọn dạng Toán
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
    const similarParams = new URLSearchParams(searchParams);
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

  const showHint = () => dispatch({ type: 'SHOW_HINT', maximum: question.hints.length });
  const nextQuestion = () => {
    if (!lastResult?.result.correct) return;
    setCurrentIndex(lastResult.currentQuestionIndex);
    setAnswer(null);
    dispatch({ type: 'NEXT_QUESTION', transfer: lastResult.currentQuestionIndex > 0 });
    setLastResult(null);
    answerMutation.reset();
  };

  return (
    <PageContainer className={'practice-page'}>
      <div className={'session-topline'}>
        <Link className={'back-link'} to={'/learn/types'}>
          <ArrowLeft size={18} /> Kết thúc
        </Link>
        <ProgressIndicator
          current={currentIndex + 1}
          total={session.questionCount}
          label={
            mode === 'LEARN' ? 'Học có gợi ý' : mode === 'REVIEW' ? 'Ôn phần còn yếu' : 'Tự luyện'
          }
        />
      </div>
      <div className={'practice-stage'}>
        <article className={'question-workspace'}>
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
              setAnswer(value);
              setLastResult(null);
              dispatch({ type: 'BEGIN_ATTEMPT' });
            }}
            disabled={answerMutation.isPending || Boolean(lastResult?.result.correct)}
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
            {!lastResult?.result.correct && (
              <Button
                variant={'quiet'}
                onClick={showHint}
                disabled={hintCount >= question.hints.length}
              >
                <Lightbulb size={19} /> Gợi ý từng bước
              </Button>
            )}
            {lastResult?.result.correct ? (
              <Button onClick={nextQuestion}>
                Câu tiếp theo <ArrowRight size={19} />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  dispatch({ type: 'SUBMIT' });
                  answerMutation.mutate({ sessionId: session.id, question });
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
                '--companion-progress': `${Math.round(((currentIndex + 1) / session.questionCount) * 100)}%`,
              } as CSSProperties
            }
          >
            <strong>{currentIndex + 1}</strong>
            <span>/ {session.questionCount}</span>
          </div>
          <div className={'companion-card'}>
            <Flame size={24} />
            <div>
              <strong>{Math.max(1, currentIndex + 1)}</strong>
              <span>Nhịp học hôm nay</span>
            </div>
          </div>
          <div className={'companion-card companion-topic'}>
            <BookOpen size={24} />
            <div>
              <span>Dạng bài hôm nay</span>
              <strong>{question.problemTypeId.replaceAll('-', ' ')}</strong>
            </div>
          </div>
          <div className={'companion-encouragement'}>
            <Star size={22} />
            <strong>Suy nghĩ kỹ rồi chọn đáp án nhé!</strong>
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
