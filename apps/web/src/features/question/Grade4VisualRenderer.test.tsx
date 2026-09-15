import type { QuestionVisual } from '@math-app/shared';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QuestionVisualRendererV2 } from './QuestionVisualRendererV2';

afterEach(cleanup);

describe('Grade 4 visual clarity', () => {
  it('renders angle measurement with a readable protractor scale', () => {
    const visual: QuestionVisual = {
      type: 'ANGLE',
      alt: 'Góc AOB cần đo.',
      degrees: 125,
      mode: 'MEASURE',
      vertexLabel: 'O',
      rayLabels: ['A', 'B'],
    };

    const { container } = render(<QuestionVisualRendererV2 visual={visual} />);

    expect(container.querySelector('[data-angle-mode="MEASURE"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-protractor-tick]')).toHaveLength(37);
    expect(container.textContent).toContain('90°');
    expect(container.textContent).toContain('O');
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('renders clock with all 60 minute ticks', () => {
    const visual: QuestionVisual = {
      type: 'CLOCK',
      alt: 'Đồng hồ chỉ 3 giờ 30 phút.',
      hour: 3,
      minute: 30,
    };

    const { container } = render(<QuestionVisualRendererV2 visual={visual} />);

    expect(container.querySelectorAll('[data-clock-minute-tick]')).toHaveLength(60);
    expect(container.textContent).toContain('Kim giờ');
    expect(container.textContent).toContain('Kim phút');
  });

  it('renders duration as a labelled start-duration-end time line', () => {
    const visual: QuestionVisual = {
      type: 'TIME_LINE',
      alt: 'Bắt đầu 8 giờ 15, kéo dài 50 phút.',
      startHour: 8,
      startMinute: 15,
      durationMinutes: 50,
      endHour: 9,
      endMinute: 5,
      hideEnd: true,
    };

    const { container } = render(<QuestionVisualRendererV2 visual={visual} />);

    expect(container.querySelector('[data-time-line]')).not.toBeNull();
    expect(container.textContent).toContain('8:15');
    expect(container.textContent).toContain('+50 phút');
    expect(container.textContent).toContain('?');
  });
});
