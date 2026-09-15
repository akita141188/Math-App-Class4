import { buildBankInMemory } from './generation/bank-builder';

describe('Grade-4 angle pedagogy guardrails', () => {
  const questions = [...buildBankInMemory('grade4-angle-pedagogy').shards.values()].flat();

  it('never asks for an exact angle degree from a freehand-only drawing', () => {
    const measurement = questions.filter(
      (question) => question.problemTypeId === 'measure-angle-degrees',
    );

    expect(measurement).toHaveLength(100);

    for (const question of measurement) {
      expect(question.visual).toMatchObject({
        type: 'ANGLE',
        mode: 'MEASURE',
        vertexLabel: 'O',
        rayLabels: ['A', 'B'],
      });
      expect(question.stem).toMatch(/thước đo góc/i);
      expect(question.stem).toMatch(/vạch 0°/i);

      if (question.visual?.type === 'ANGLE') {
        expect(question.visual.alt).not.toMatch(
          new RegExp(`\\b${question.visual.degrees}\\s*(?:°|độ)`, 'i'),
        );
      }
    }
  });

  it('classifies angles by comparison with a visible right-angle reference, not by hidden measurement', () => {
    const classification = questions.filter(
      (question) => question.problemTypeId === 'classify-angles',
    );

    expect(classification).toHaveLength(100);

    for (const question of classification) {
      expect(question.visual).toMatchObject({
        type: 'ANGLE',
        mode: 'CLASSIFY',
        vertexLabel: 'O',
        rayLabels: ['A', 'B'],
      });
      expect(question.stem).toMatch(/góc vuông 90°.*tham chiếu/i);
      expect(question.stem).not.toMatch(/góc có số đo \d+°/i);
    }
  });
});
