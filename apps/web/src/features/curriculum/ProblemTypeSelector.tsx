import type { MasteryLevel, ProblemTypeSummary } from '@math-app/shared';
import { Check, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  problemType: ProblemTypeSummary;
  selected: boolean;
  masteryLevel: MasteryLevel;
  onToggle: () => void;
}

const masteryLabels: Record<MasteryLevel, string> = {
  NEW: 'Chưa học',
  LEARNING: 'Đang làm quen',
  PRACTICING: 'Đang luyện',
  CONFIDENT: 'Đã vững',
  NEEDS_REVIEW: 'Cần ôn lại',
};

const domainIllustrations: Record<string, string> = {
  'number-and-operations': '/assets/redesign/topic-numbers.webp',
  fractions: '/assets/redesign/topic-fractions.webp',
  measurement: '/assets/redesign/topic-measurement.webp',
  geometry: '/assets/redesign/topic-geometry.webp',
  'word-problems': '/assets/redesign/topic-numbers.webp',
  'data-and-statistics': '/assets/redesign/topic-measurement.webp',
  logic: '/assets/redesign/topic-geometry.webp',
};

export function ProblemTypeSelector({ problemType, selected, masteryLevel, onToggle }: Props) {
  return (
    <article className={selected ? 'problem-type-card selected' : 'problem-type-card'}>
      <button
        type={'button'}
        className={'problem-type-select'}
        onClick={onToggle}
        aria-pressed={selected}
      >
        <span className={'selection-box'} aria-hidden={'true'}>
          {selected && <Check size={18} />}
        </span>
        <span className={'problem-type-illustration'} aria-hidden={'true'}>
          <img
            src={domainIllustrations[problemType.domainId] ?? '/assets/redesign/topic-numbers.webp'}
            alt={''}
          />
        </span>
        <span className={'problem-type-copy'}>
          <strong>{problemType.name}</strong>
          <small>{problemType.description}</small>
        </span>
      </button>
      <footer>
        <span>{problemType.questionCount} câu</span>
        {problemType.visualQuestionCount > 0 && (
          <span>
            <Eye size={15} /> Có hình
          </span>
        )}
        <span className={'mastery-pill mastery-' + masteryLevel.toLowerCase()}>
          {masteryLabels[masteryLevel]}
        </span>
        <Link
          to={`/learn/grade/4/${problemType.domainId}/${problemType.topicId}/${problemType.id}`}
        >
          Xem dạng
        </Link>
      </footer>
    </article>
  );
}
