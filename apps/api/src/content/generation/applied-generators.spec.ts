import { finalizedProblemBlueprints } from '../catalog.v2.data';
import { generateAppliedCore } from './applied-generators';

describe('measurement, geometry, word-problem and data oracles', () => {
  it('keeps every applied generator invariant true', () => {
    for (const type of finalizedProblemBlueprints) {
      for (let index = 0; index < 100; index += 1) {
        const core = generateAppliedCore(type, index);
        if (!core) continue;
        const p = core.params;
        const expected = core.expectedAnswer;
        if (
          ['length-conversion', 'mass-conversion', 'area-conversion', 'time-conversion'].includes(
            type.id,
          )
        )
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value:
              Number(p.major) * Number(p.majorFactor) + Number(p.minor) * Number(p.minorFactor),
          });
        if (type.id === 'compare-measurements')
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value: Math.max(
              Number(p.major) * Number(p.majorFactor) + Number(p.minor) * Number(p.minorFactor),
              Number(p.comparison),
            ),
          });
        if (type.id === 'money-change')
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value: Number(p.paid) - Number(p.price),
            unit: 'đồng',
          });
        if (['rectangle-perimeter', 'rectangle-area', 'geometry-word-problem'].includes(type.id)) {
          const value =
            type.id === 'rectangle-perimeter'
              ? 2 * (Number(p.width) + Number(p.height))
              : Number(p.width) * Number(p.height);
          expect(expected).toMatchObject({ kind: 'NUMBER', value });
        }
        if (type.id === 'square-perimeter' || type.id === 'square-area') {
          const value = type.id === 'square-area' ? Number(p.side) ** 2 : Number(p.side) * 4;
          expect(expected).toMatchObject({ kind: 'NUMBER', value });
          expect(core.visual).toMatchObject({
            type: 'GEOMETRY_DIAGRAM',
            shape: 'SQUARE',
            width: p.side,
            height: p.side,
          });
        }
        if (type.id === 'sum-difference-problem') {
          const answer = (Number(p.total) + Number(p.difference)) / 2;
          expect(Number.isInteger(answer)).toBe(true);
          expect(expected).toMatchObject({ kind: 'NUMBER', value: answer });
        }
        if (type.id === 'unit-rate-problem')
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value: Number(p.each) * Number(p.targetGroups),
          });
        if (type.id === 'read-bar-chart' || type.id === 'read-data-table')
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value: Number(p.a) + Number(p.b) + Number(p.c) + Number(p.d ?? 0),
          });
        if (type.id === 'compare-chart-data') {
          const values = [Number(p.a), Number(p.b), Number(p.c), Number(p.d)];
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value: Math.max(...values) - Math.min(...values),
          });
        }
      }
    }
  });
});
