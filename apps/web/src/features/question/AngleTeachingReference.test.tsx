import type { QuestionVisual } from '@math-app/shared';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QuestionVisualRendererV2 } from './QuestionVisualRendererV2';

afterEach(cleanup);

describe('Angle teaching references', () => {
  it('shows a protractor scale when an exact degree must be read', () => {
    const visual: QuestionVisual = {
      type: 'ANGLE',
      alt: 'Thước đo góc với cạnh OA ở vạch 0 độ.',
      degrees: 135,
      mode: 'MEASURE',
      vertexLabel: 'O',
      rayLabels: ['A', 'B'],
    };

    const { container } = render(<QuestionVisualRendererV2 visual={visual} />);

    expect(container.querySelector('[data-angle-mode="MEASURE"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-protractor-tick]')).toHaveLength(37);
    expect(container.textContent).toContain('0°');
    expect(container.textContent).toContain('90°');
    expect(container.textContent).toContain('180°');
    expect(container.textContent).toContain('Thước đo góc');
  });

  it('shows a separate right-angle reference for classification questions', () => {
    const visual: QuestionVisual = {
      type: 'ANGLE',
      alt: 'Góc AOB cần phân loại.',
      degrees: 120,
      mode: 'CLASSIFY',
      vertexLabel: 'O',
      rayLabels: ['A', 'B'],
    };

    const { container } = render(<QuestionVisualRendererV2 visual={visual} />);

    expect(container.querySelector('[data-angle-mode="CLASSIFY"]')).not.toBeNull();
    expect(container.querySelector('[data-angle-reference="RIGHT_ANGLE"]')).not.toBeNull();
    expect(container.textContent).toContain('Góc vuông');
    expect(container.textContent).toContain('90°');
  });
});
