import { finalizedProblemBlueprints, QUESTIONS_PER_PROBLEM_TYPE } from '../catalog.v2.data';
import { auditBank, duplicateSummary } from '../content-quality.v2';
import { buildBankInMemory } from './bank-builder';
import { generateAppliedCore } from './applied-generators';
import { generateArithmeticCore } from './arithmetic-generators';
import { generateFractionCore } from './fraction-generators';
import { generateKnttCore } from './kntt-generators';

describe('Grade 4 bank v3', () => {
  it('generates 100 unique valid questions with 30/50/20 and five templates per leaf', () => {
    const bank = buildBankInMemory('fixed-time');
    const questions = [...bank.shards.values()].flat();
    expect(bank.manifest.problemTypes).toHaveLength(finalizedProblemBlueprints.length);
    for (const entry of bank.manifest.problemTypes) {
      expect(entry).toMatchObject({
        questionCount: 100,
        easy: 30,
        medium: 50,
        hard: 20,
        templates: 5,
      });
    }
    expect(questions).toHaveLength(finalizedProblemBlueprints.length * QUESTIONS_PER_PROBLEM_TYPE);
    expect(duplicateSummary(questions)).toEqual({ duplicateIds: 0, duplicateFingerprints: 0 });
    expect(auditBank(questions)).toEqual([]);
  });

  it('rebuilds identical ids, fingerprints and question payloads for the same source', () => {
    const first = buildBankInMemory('first-time');
    const second = buildBankInMemory('second-time');
    for (const type of finalizedProblemBlueprints) {
      expect(second.shards.get(type.id)).toEqual(first.shards.get(type.id));
    }
  });

  it('keeps generator math invariants true for every generated core', () => {
    for (const blueprint of finalizedProblemBlueprints) {
      for (let index = 0; index < QUESTIONS_PER_PROBLEM_TYPE; index += 1) {
        const core =
          generateKnttCore(blueprint, index) ??
          generateArithmeticCore(blueprint, index) ??
          generateFractionCore(blueprint, index) ??
          generateAppliedCore(blueprint, index);
        expect(core).not.toBeNull();
        if (!core) continue;
        const p = core.params;
        const expected = core.expectedAnswer;
        if (blueprint.id === 'column-addition' || blueprint.id === 'mental-addition')
          expect(expected).toMatchObject({ kind: 'NUMBER', value: Number(p.a) + Number(p.b) });
        if (blueprint.id === 'column-subtraction' || blueprint.id === 'mental-subtraction')
          expect(expected).toMatchObject({ kind: 'NUMBER', value: Number(p.a) - Number(p.b) });
        if (
          ['multiplication-facts', 'multiply-one-digit', 'multiply-two-digits'].includes(
            blueprint.id,
          )
        )
          expect(expected).toMatchObject({
            kind: 'NUMBER',
            value: Number(p.multiplicand) * Number(p.factor),
          });
        if (['division-facts', 'divide-one-digit', 'divide-two-digits'].includes(blueprint.id)) {
          expect(Number(p.dividend) % Number(p.divisor)).toBe(0);
          expect(expected).toMatchObject({ kind: 'NUMBER', value: Number(p.quotient) });
        }
        if (blueprint.id === 'division-remainder') {
          expect(Number(p.remainder)).toBeGreaterThanOrEqual(0);
          expect(Number(p.remainder)).toBeLessThan(Number(p.divisor));
          expect(Number(p.dividend)).toBe(
            Number(p.divisor) * Number(p.quotient) + Number(p.remainder),
          );
        }
        if (core.visual?.type === 'FRACTION_CIRCLE' || core.visual?.type === 'FRACTION_BAR') {
          expect(core.visual.equalParts).toBeGreaterThanOrEqual(2);
          expect(core.visual.shadedParts).toBeGreaterThanOrEqual(0);
          expect(core.visual.shadedParts).toBeLessThanOrEqual(core.visual.equalParts);
          expect(expected).toMatchObject({
            kind: 'FRACTION',
            numerator: core.visual.shadedParts,
            denominator: core.visual.equalParts,
          });
        }
        if (core.visual?.type === 'GEOMETRY_DIAGRAM') {
          expect(core.visual.width).toBeGreaterThan(0);
          expect(core.visual.height).toBeGreaterThan(0);
          if (core.visual.shape === 'SQUARE') expect(core.visual.width).toBe(core.visual.height);
        }
      }
    }
  });
});
