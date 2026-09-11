import { finalizedProblemBlueprints } from '../catalog.v2.data';
import { gcd, lcm, reduceFraction } from './content-math';
import { generateFractionCore } from './fraction-generators';

describe('fraction generator oracles', () => {
  const types = finalizedProblemBlueprints.filter((type) => type.family === 'FRACTION');

  it('matches independent fraction arithmetic for every generated parameter set', () => {
    for (const type of types) {
      for (let index = 0; index < 100; index += 1) {
        const core = generateFractionCore(type, index)!;
        const p = core.params;
        const expected = core.expectedAnswer;
        if (type.id === 'reduce-fractions') {
          const result = reduceFraction(Number(p.rawNumerator), Number(p.rawDenominator));
          expect(expected).toMatchObject({ kind: 'FRACTION', ...result });
          expect(gcd(result.numerator, result.denominator)).toBe(1);
        }
        if (type.id === 'common-denominator') {
          expect(Number(p.common)).toBe(lcm(Number(p.leftDenominator), Number(p.rightDenominator)));
          expect(expected.kind).toBe('FRACTION');
          if (expected.kind === 'FRACTION')
            expect(expected.numerator * Number(p.leftDenominator)).toBe(
              Number(p.leftNumerator) * expected.denominator,
            );
        }
        if (type.id === 'add-fractions' || type.id === 'subtract-fractions') {
          expect(expected.kind).toBe('FRACTION');
          if (expected.kind === 'FRACTION') {
            const sign = type.id === 'add-fractions' ? 1 : -1;
            expect(expected.numerator / expected.denominator).toBeCloseTo(
              (Number(p.leftNumerator) + sign * Number(p.rightNumerator)) /
                Number(p.commonDenominator),
            );
          }
        }
        if (type.id === 'multiply-fractions' || type.id === 'divide-fractions') {
          expect(expected.kind).toBe('FRACTION');
          if (expected.kind === 'FRACTION') {
            const left = Number(p.numerator) / Number(p.denominator);
            const right = Number(p.rightNumerator) / Number(p.rightDenominator);
            expect(expected.numerator / expected.denominator).toBeCloseTo(
              type.id === 'multiply-fractions' ? left * right : left / right,
            );
          }
        }
        if (type.id === 'fraction-of-quantity') {
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value: (Number(p.whole) * Number(p.partNumerator)) / Number(p.partDenominator),
          });
        }
      }
    }
  });
});
