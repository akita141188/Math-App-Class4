export type QuestionNavigatorState = 'done' | 'working' | 'unanswered';

interface QuestionNavigatorProps {
  ariaLabel: string;
  currentIndex: number;
  total: number;
  summary: string;
  disabled?: boolean;
  stateForIndex: (index: number) => QuestionNavigatorState;
  onSelect: (index: number) => void;
}

export function QuestionNavigator({
  ariaLabel,
  currentIndex,
  total,
  summary,
  disabled = false,
  stateForIndex,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <nav className={'question-navigator'} aria-label={ariaLabel}>
      <div className={'question-navigator-heading'}>
        <div>
          <strong>Danh sách câu</strong>
          <span>{summary}</span>
        </div>
        <b>
          {currentIndex + 1}/{total}
        </b>
      </div>

      <div className={'question-navigator-grid'}>
        {Array.from({ length: total }, (_, index) => {
          const state = stateForIndex(index);
          const current = index === currentIndex;
          return (
            <button
              key={index}
              type={'button'}
              disabled={disabled}
              onClick={() => onSelect(index)}
              className={`question-nav-button ${state} ${current ? 'current' : ''}`}
              aria-current={current ? 'step' : undefined}
              aria-label={`Câu ${index + 1}${state === 'done' ? ' đã làm' : state === 'working' ? ' đang làm' : ' chưa làm'}${current ? ', câu hiện tại' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className={'question-navigator-legend'} aria-hidden={'true'}>
        <span>
          <i className={'legend-current'} /> Hiện tại
        </span>
        <span>
          <i className={'legend-done'} /> Đã làm
        </span>
        <span>
          <i className={'legend-working'} /> Đang làm
        </span>
      </div>
    </nav>
  );
}
