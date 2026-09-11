import type { AnswerResult, ProgressSummary, SkillProgress } from '@math-app/shared';

const storageKey = 'math-app-class4-progress-v1';

const emptySummary: ProgressSummary = {
  totalQuestions: 0,
  independentCorrect: 0,
  hintedCorrect: 0,
  skills: [],
};

function masteryFor(
  progress: Pick<SkillProgress, 'attempts' | 'correct' | 'incorrect'>,
): SkillProgress['masteryLevel'] {
  if (progress.attempts === 0) return 'NEW';
  const rate = progress.correct / progress.attempts;
  if (progress.incorrect >= 2 && rate < 0.6) return 'NEEDS_REVIEW';
  if (progress.attempts >= 5 && rate >= 0.8) return 'CONFIDENT';
  if (progress.attempts >= 3) return 'PRACTICING';
  return 'LEARNING';
}

export interface ProgressRepository {
  getSummary(): ProgressSummary;
  recordAttempt(skillId: string, result: AnswerResult, hintCount: number): ProgressSummary;
  clear(): void;
}

export const localProgressRepository: ProgressRepository = {
  getSummary() {
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? (JSON.parse(saved) as ProgressSummary) : emptySummary;
    } catch {
      return emptySummary;
    }
  },

  recordAttempt(skillId, result, hintCount) {
    const current = this.getSummary();
    const existing = current.skills.find((skill) => skill.skillId === skillId);
    const updated: SkillProgress = {
      skillId,
      attempts: (existing?.attempts ?? 0) + 1,
      correct: (existing?.correct ?? 0) + (result.correct ? 1 : 0),
      incorrect: (existing?.incorrect ?? 0) + (result.correct ? 0 : 1),
      independentCorrect:
        (existing?.independentCorrect ?? 0) + (result.correct && hintCount === 0 ? 1 : 0),
      hintedCorrect: (existing?.hintedCorrect ?? 0) + (result.correct && hintCount > 0 ? 1 : 0),
      lastPracticedAt: new Date().toISOString(),
      recentMistakes: result.misconception
        ? [result.misconception, ...(existing?.recentMistakes ?? [])].slice(0, 5)
        : (existing?.recentMistakes ?? []),
      masteryLevel: 'LEARNING',
    };
    updated.masteryLevel = masteryFor(updated);
    const next: ProgressSummary = {
      totalQuestions: current.totalQuestions + 1,
      independentCorrect: current.independentCorrect + (result.correct && hintCount === 0 ? 1 : 0),
      hintedCorrect: current.hintedCorrect + (result.correct && hintCount > 0 ? 1 : 0),
      skills: [...current.skills.filter((skill) => skill.skillId !== skillId), updated],
    };
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
  },

  clear() {
    window.localStorage.removeItem(storageKey);
  },
};
