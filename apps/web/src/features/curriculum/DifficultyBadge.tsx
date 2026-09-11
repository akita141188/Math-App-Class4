import type { Difficulty } from '@math-app/shared';

const labels: Record<Difficulty, string> = {
  EASY: 'Cơ bản',
  MEDIUM: 'Vừa sức',
  HARD: 'Thử thách',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`difficulty-badge difficulty-${difficulty.toLowerCase()}`}>
      {labels[difficulty]}
    </span>
  );
}
