import type { DemoProblem, LearningState } from '@math-app/shared';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, Lightbulb, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { checkDemoAnswer, getDemoProblem } from '../api/client';
import { Button } from '../components/Button';
import { FeedbackState } from '../components/FeedbackState';
import { LearningCard } from '../components/LearningCard';
import { PageContainer } from '../components/PageContainer';
import { ProgressIndicator } from '../components/ProgressIndicator';

const fallbackProblem: DemoProblem = {
  id: 'demo-multiplication-01',
  grade: 4,
  topic: 'Phép nhân với số có một chữ số',
  statement:
    'Một cửa hàng có 245 hộp bánh. Mỗi hộp có 6 chiếc bánh. Hỏi cửa hàng có tất cả bao nhiêu chiếc bánh?',
  question: 'Cửa hàng có tất cả bao nhiêu chiếc bánh?',
  hints: [
    'Tìm hai số cho biết số hộp và số bánh trong mỗi hộp.',
    'Mỗi hộp đều có 6 chiếc bánh. Em nên dùng phép tính nào?',
    'Đặt tính 245 × 6 và nhân lần lượt từ hàng đơn vị.',
  ],
};

const steps: Array<{
  state: LearningState;
  title: string;
  prompt: string;
  placeholder: string;
}> = [
  {
    state: 'UNDERSTAND_DATA',
    title: 'Đọc và hiểu đề',
    prompt: 'Bài toán cho chúng ta biết những gì?',
    placeholder: 'Em viết những điều đề bài đã cho…',
  },
  {
    state: 'UNDERSTAND_QUESTION',
    title: 'Xác định câu hỏi',
    prompt: 'Bài toán đang hỏi chúng ta điều gì?',
    placeholder: 'Em viết điều mình cần tìm…',
  },
  {
    state: 'STRATEGY',
    title: 'Chọn cách làm',
    prompt: 'Muốn tìm tất cả số bánh, em sẽ dùng phép tính nào?',
    placeholder: 'Em nêu phép tính và lý do…',
  },
  {
    state: 'ATTEMPT',
    title: 'Tự giải',
    prompt: 'Bây giờ em hãy tính và viết đáp số.',
    placeholder: 'Em viết kết quả của mình…',
  },
];

interface LocationState {
  statement?: string;
}

function containsAll(value: string, parts: string[]): boolean {
  const normalized = value.toLocaleLowerCase('vi');
  return parts.every((part) => normalized.includes(part));
}

export function LearningSessionPage() {
  const location = useLocation();
  const customStatement = (location.state as LocationState | null)?.statement;
  const problemQuery = useQuery({
    queryKey: ['demo-problem'],
    queryFn: getDemoProblem,
  });
  const problem = customStatement
    ? { ...fallbackProblem, statement: customStatement }
    : (problemQuery.data ?? fallbackProblem);

  const [stepIndex, setStepIndex] = useState(0);
  const [learningState, setLearningState] = useState<LearningState>('UNDERSTAND_DATA');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'hint' | 'retry';
    message: string;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [transferAnswer, setTransferAnswer] = useState('');
  const [transferDone, setTransferDone] = useState(false);
  const step = steps[stepIndex] ?? steps[0]!;

  function showHint() {
    setLearningState('HINT');
    setFeedback({
      kind: 'hint',
      message:
        problem.hints[Math.min(stepIndex, 2)] ?? problem.hints[0] ?? 'Em đọc lại từng câu nhé.',
    });
  }

  function moveToNextStep(message: string) {
    const nextIndex = Math.min(stepIndex + 1, steps.length - 1);
    setStepIndex(nextIndex);
    setLearningState(steps[nextIndex]?.state ?? 'ATTEMPT');
    setAnswer('');
    setFeedback({ kind: 'success', message });
  }

  async function checkCurrentAnswer() {
    const value = answer.trim();
    if (!value) {
      setLearningState('RETRY');
      setFeedback({ kind: 'retry', message: 'Em thử viết suy nghĩ của mình trước nhé.' });
      return;
    }

    if (stepIndex === 0) {
      if (containsAll(value, ['245', '6'])) {
        moveToNextStep('Đúng rồi! Em đã tìm đủ hai dữ kiện quan trọng.');
      } else {
        setLearningState('ERROR_DIAGNOSIS');
        setFeedback({
          kind: 'retry',
          message: 'Mình còn thiếu một dữ kiện. Hãy tìm số hộp và số bánh trong mỗi hộp.',
        });
      }
      return;
    }

    if (stepIndex === 1) {
      if (value.includes('bao nhiêu') || value.includes('tất cả') || value.includes('số bánh')) {
        moveToNextStep('Chính xác! Ta cần tìm tổng số chiếc bánh.');
      } else {
        setLearningState('ERROR_DIAGNOSIS');
        setFeedback({
          kind: 'retry',
          message: 'Em đọc lại câu cuối của đề và nói rõ đại lượng cần tìm nhé.',
        });
      }
      return;
    }

    if (stepIndex === 2) {
      if (containsAll(value, ['245', '6']) && /nhân|×|\*/i.test(value)) {
        moveToNextStep('Hay lắm! Phép nhân phù hợp vì mỗi hộp có số bánh như nhau.');
      } else {
        setLearningState('FOUNDATION_REVIEW');
        setFeedback({
          kind: 'retry',
          message: 'Có 245 nhóm, mỗi nhóm 6 chiếc. Phép tính nào dùng cho các nhóm bằng nhau?',
        });
      }
      return;
    }

    if (customStatement) {
      setLearningState('FOUNDATION_REVIEW');
      setFeedback({
        kind: 'hint',
        message:
          'Bản hiện tại chưa tự chấm đề em nhập. Em có thể luyện theo dạng với các câu đã được kiểm tra nội dung.',
      });
      return;
    }

    setChecking(true);
    try {
      const result = await checkDemoAnswer({ problemId: problem.id, answer: value });
      setLearningState(result.correct ? 'TRANSFER_TEST' : result.nextState);
      setFeedback({
        kind: result.correct ? 'success' : 'retry',
        message: result.feedback,
      });
    } catch {
      const correct = value.replace(/\s/g, '').includes('1470');
      setLearningState(correct ? 'TRANSFER_TEST' : 'ERROR_DIAGNOSIS');
      setFeedback({
        kind: correct ? 'success' : 'retry',
        message: correct
          ? 'Đúng rồi! 245 × 6 = 1 470 chiếc bánh.'
          : 'Em kiểm tra lại phép nhân 245 × 6, nhất là phần nhớ ở hàng chục nhé.',
      });
    } finally {
      setChecking(false);
    }
  }

  function checkTransfer() {
    const correct = transferAnswer.replace(/\s/g, '').includes('512');
    setTransferDone(correct);
    setLearningState(correct ? 'COMPLETE' : 'TRANSFER_TEST');
    setFeedback({
      kind: correct ? 'success' : 'retry',
      message: correct
        ? 'Tuyệt vời! Em đã biết áp dụng cách làm vào bài mới.'
        : 'Gần đúng rồi. Em hãy thử đặt tính 128 × 4 một lần nữa.',
    });
  }

  const solved =
    learningState === 'SOLVED' ||
    learningState === 'TRANSFER_TEST' ||
    learningState === 'COMPLETE' ||
    transferDone;

  if (learningState === 'COMPLETE') {
    return (
      <PageContainer className={'session-page'}>
        <LearningCard
          eyebrow={'Hoàn thành'}
          title={'Em đã vận dụng được cách làm'}
          className={'transfer-card'}
        >
          <div className={'celebration-mark'} aria-hidden={'true'}>
            <Check />
          </div>
          <p>Tuyệt vời! Em đã giải đúng bài chính và một bài tương tự.</p>
          <div className={'session-actions'}>
            <Link className={'button button-secondary'} to={'/learn/types'}>
              Chọn dạng khác
            </Link>
            <Link className={'button button-primary'} to={'/daily'}>
              Bài tập hôm nay <ArrowRight size={19} aria-hidden={'true'} />
            </Link>
          </div>
        </LearningCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="session-page">
      <div className="session-topline">
        <Link to="/solve" className="back-link">
          <ArrowLeft size={19} aria-hidden="true" /> Kết thúc
        </Link>
        <ProgressIndicator
          current={solved ? 4 : stepIndex + 1}
          total={4}
          label={solved ? 'Đã hoàn thành bài chính' : 'Đang tìm hiểu bài toán'}
        />
      </div>

      {problemQuery.isError && !customStatement && (
        <div className="offline-banner" role="status">
          Đang dùng bài mẫu có sẵn. Em vẫn có thể học bình thường.
        </div>
      )}

      <LearningCard eyebrow="Đề bài" className="problem-card">
        {problemQuery.isLoading && !customStatement ? (
          <div className="problem-loading">
            <LoaderCircle className="spin" aria-hidden="true" /> Đang chuẩn bị bài…
          </div>
        ) : (
          <>
            <p>{problem.statement}</p>
            <span className="problem-topic">{problem.topic}</span>
          </>
        )}
      </LearningCard>

      {!solved ? (
        <LearningCard
          eyebrow={'Bước ' + String(stepIndex + 1)}
          title={step.title}
          aside={<span className="state-chip">{learningState.replaceAll('_', ' ')}</span>}
          className="tutor-workspace"
        >
          <p className="tutor-question">{step.prompt}</p>
          <label className="answer-label" htmlFor="student-answer">
            Suy nghĩ của em
          </label>
          <textarea
            id="student-answer"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              if (feedback?.kind === 'retry') setFeedback(null);
            }}
            rows={4}
            placeholder={step.placeholder}
          />
          {feedback && <FeedbackState kind={feedback.kind}>{feedback.message}</FeedbackState>}
          <div className="session-actions">
            <Button variant="quiet" onClick={showHint}>
              <Lightbulb size={20} aria-hidden="true" /> Gợi ý
            </Button>
            <Button onClick={() => void checkCurrentAnswer()} disabled={checking}>
              {checking ? (
                <LoaderCircle className="spin" size={20} aria-hidden="true" />
              ) : (
                <Check size={20} aria-hidden="true" />
              )}
              Kiểm tra
            </Button>
          </div>
        </LearningCard>
      ) : (
        <LearningCard
          eyebrow="Thử thách nhỏ"
          title="Em thử một bài tương tự nhé"
          className="transfer-card"
        >
          <div className="celebration-mark" aria-hidden="true">
            ✓
          </div>
          <p>Một kho có 128 thùng sữa. Mỗi thùng có 4 hộp. Kho có tất cả bao nhiêu hộp sữa?</p>
          <label className="answer-label" htmlFor="transfer-answer">
            Đáp số của em
          </label>
          <div className="transfer-input-row">
            <input
              id="transfer-answer"
              value={transferAnswer}
              onChange={(event) => setTransferAnswer(event.target.value)}
              inputMode="numeric"
              placeholder="Nhập kết quả"
            />
            <Button onClick={checkTransfer}>
              Kiểm tra <ArrowRight size={19} aria-hidden="true" />
            </Button>
          </div>
          {feedback && <FeedbackState kind={feedback.kind}>{feedback.message}</FeedbackState>}
        </LearningCard>
      )}
    </PageContainer>
  );
}
