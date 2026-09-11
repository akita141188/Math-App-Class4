import { describe, expect, it } from 'vitest';
import { buildBarLayout, buildObjectGroupLayout, geometryDiagramBox } from './visualGeometry';

describe('visual geometry invariants', () => {
  it('keeps object groups and every item inside the viewBox', () => {
    for (const groups of [1, 3, 6, 10]) {
      for (const items of [1, 6, 15, 30]) {
        const layout = buildObjectGroupLayout(groups, items);
        expect(layout).toHaveLength(groups);
        for (const group of layout) {
          expect(group.x).toBeGreaterThanOrEqual(0);
          expect(group.x + group.width).toBeLessThanOrEqual(420);
          for (const point of group.points) {
            expect(point.x - point.radius).toBeGreaterThanOrEqual(group.x);
            expect(point.x + point.radius).toBeLessThanOrEqual(group.x + group.width);
            expect(point.y - point.radius).toBeGreaterThanOrEqual(group.y);
            expect(point.y + point.radius).toBeLessThanOrEqual(group.y + group.height);
          }
        }
      }
    }
  });

  it('scales large bar values inside the chart area', () => {
    const bars = buildBarLayout([2, 38, 500, 17]);
    expect(bars).toHaveLength(4);
    for (const bar of bars) {
      expect(bar.y).toBeGreaterThanOrEqual(55);
      expect(bar.y + bar.height).toBeLessThanOrEqual(180);
      expect(bar.x).toBeGreaterThanOrEqual(0);
      expect(bar.x + bar.width).toBeLessThanOrEqual(420);
    }
  });

  it('renders a square with equal screen width and height', () => {
    const square = geometryDiagramBox('SQUARE');
    const rectangle = geometryDiagramBox('RECTANGLE');
    expect(square.width).toBe(square.height);
    expect(rectangle.width).not.toBe(rectangle.height);
  });
});
