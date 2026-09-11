import type { QuestionFormat, StudentQuestion } from '@math-app/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnswerInput } from './AnswerInput';
import { buildFractionCircleSectors } from './fractionCircleGeometry';
import { QuestionVisualRenderer } from './QuestionVisualRenderer';

function makeQuestion(format: QuestionFormat): StudentQuestion {
  return {
    id: `question-${format}`,
    contentVersion: 'grade4-v3',
    templateId: `question-${format}-t1`,
    fingerprint: `question-${format}-fingerprint`,
    grade: 4,
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    skillId: 'multiply-one-digit-skill',
    problemTypeId: 'multiply-one-digit',
    format,
    difficulty: 'EASY',
    assessmentLevel: 'LEVEL_1',
    testEligible: true,
    scoreWeight: 1,
    stem: 'Câu hỏi mẫu',
    options: [
      { id: 'a', label: '12' },
      { id: 'b', label: '14' },
    ],
    orderingItems: [
      { id: 'third', label: '9' },
      { id: 'first', label: '3' },
      { id: 'second', label: '6' },
    ],
    matchingPairs: [
      { leftId: 'left-1', leftLabel: '3 × 4', rightId: 'right-1', rightLabel: '12' },
      { leftId: 'left-2', leftLabel: '2 × 7', rightId: 'right-2', rightLabel: '14' },
    ],
    hints: [{ level: 1, text: 'Gợi ý' }],
    prerequisiteSkillIds: [],
    status: 'REVIEWED',
    version: 1,
  };
}

afterEach(cleanup);

describe('AnswerInput', () => {
  it('supports single and multiple option selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <AnswerInput question={makeQuestion('MULTIPLE_CHOICE')} value={null} onChange={onChange} />,
    );
    await user.click(screen.getByText('12'));
    expect(onChange).toHaveBeenCalledWith('a');

    rerender(
      <AnswerInput question={makeQuestion('MULTIPLE_SELECT')} value={[]} onChange={onChange} />,
    );
    await user.click(screen.getByText('14'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('supports true-false, ordering and matching controls', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <AnswerInput question={makeQuestion('TRUE_FALSE')} value={null} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Đúng' }));
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<AnswerInput question={makeQuestion('ORDERING')} value={null} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Đưa 9 xuống' }));
    expect(onChange).toHaveBeenCalledWith(['first', 'third', 'second']);

    rerender(<AnswerInput question={makeQuestion('MATCHING')} value={{}} onChange={onChange} />);
    await user.selectOptions(screen.getAllByRole('combobox')[0]!, 'right-1');
    expect(onChange).toHaveBeenCalledWith({ 'left-1': 'right-1' });
  });

  it('collects calculation, explanation and final answer for written solutions', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AnswerInput question={makeQuestion('WRITTEN_SOLUTION')} value={{}} onChange={onChange} />,
    );
    await user.type(screen.getByLabelText('Đáp số'), '4');
    expect(onChange).toHaveBeenLastCalledWith({ final: '4' });
  });

  it('renders an accessible visual description', () => {
    render(
      <QuestionVisualRenderer
        visual={{
          type: 'FRACTION_BAR',
          alt: 'Hình chữ nhật chia bốn phần, tô ba phần.',
          shadedParts: 3,
          equalParts: 4,
        }}
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Hình chữ nhật chia bốn phần, tô ba phần.' }),
    ).toBeVisible();
  });

  it('serializes a fraction answer as numerator and denominator', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AnswerInput
        question={{
          ...makeQuestion('FILL_BLANK'),
          visual: {
            type: 'FRACTION_CIRCLE',
            alt: 'Hình tròn chia sáu phần bằng nhau, tô một phần.',
            equalParts: 6,
            shadedParts: 1,
          },
        }}
        value={{ kind: 'FRACTION', numerator: 1, denominator: -1 }}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByLabelText('Mẫu số'), '6');
    expect(onChange).toHaveBeenLastCalledWith({
      kind: 'FRACTION',
      numerator: 1,
      denominator: 6,
    });
  });

  it('uses the canonical fraction control for a visual fraction even when marked written', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AnswerInput
        question={{
          ...makeQuestion('WRITTEN_SOLUTION'),
          visual: {
            type: 'FRACTION_CIRCLE',
            alt: 'Hình tròn chia sáu phần bằng nhau, tô một phần.',
            equalParts: 6,
            shadedParts: 1,
          },
        }}
        value={{ kind: 'FRACTION', numerator: -1, denominator: -1 }}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByLabelText('Tử số'), '1');
    expect(onChange).toHaveBeenLastCalledWith({
      kind: 'FRACTION',
      numerator: 1,
      denominator: -1,
    });
    expect(screen.queryByLabelText('Đáp số')).not.toBeInTheDocument();
  });
});

describe('fraction circle geometry', () => {
  const cases = [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [1, 5],
    [2, 5],
    [1, 6],
    [5, 6],
    [3, 8],
  ] as const;

  it.each(cases)('builds %i/%i with equal, correctly shaded sectors', (numerator, denominator) => {
    const sectors = buildFractionCircleSectors(denominator, numerator);
    expect(sectors).toHaveLength(denominator);
    expect(sectors.filter((sector) => sector.shaded)).toHaveLength(numerator);
    for (const sector of sectors) {
      expect(sector.endAngle - sector.startAngle).toBeCloseTo((Math.PI * 2) / denominator, 10);
      expect(sector.path).toMatch(/^M 210 110 L .* A 78 78 .* Z$/);
    }
  });

  it('renders six clipped paths and shades exactly one for 1/6', () => {
    const { container } = render(
      <QuestionVisualRenderer
        visual={{
          type: 'FRACTION_CIRCLE',
          alt: 'Hình tròn chia sáu phần bằng nhau, tô một phần.',
          equalParts: 6,
          shadedParts: 1,
        }}
      />,
    );
    expect(container.querySelectorAll('[data-fraction-sector]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-fraction-sector][data-shaded=true]')).toHaveLength(1);
    expect(container.querySelector('g[clip-path]')).not.toBeNull();
  });
});
