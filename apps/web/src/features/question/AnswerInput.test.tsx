import type { StudentQuestion } from '@math-app/shared';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnswerInput } from './AnswerInput';

const writtenQuestion: StudentQuestion = {
  id: 'written-1',
  contentVersion: 'grade4-v3',
  templateId: 'number-pattern-t1',
  fingerprint: 'written-fingerprint',
  grade: 4,
  domainId: 'number-and-operations',
  topicId: 'patterns',
  skillId: 'number-pattern-skill',
  problemTypeId: 'number-pattern',
  format: 'WRITTEN_SOLUTION',
  difficulty: 'HARD',
  assessmentLevel: 'LEVEL_3',
  testEligible: true,
  scoreWeight: 1,
  stem: 'Tìm số tiếp theo.',
  hints: [],
  prerequisiteSkillIds: [],
  status: 'REVIEWED',
  version: 1,
};

describe('AnswerInput written solution', () => {
  it('asks only for the final answer', () => {
    render(<AnswerInput question={writtenQuestion} value={null} onChange={vi.fn()} />);

    expect(screen.getByText('Đáp số')).toBeVisible();
    expect(screen.queryByText('Phép tính')).not.toBeInTheDocument();
    expect(screen.queryByText('Cách em suy nghĩ')).not.toBeInTheDocument();
  });
});
