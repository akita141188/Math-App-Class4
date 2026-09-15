import { finalizedProblemBlueprints } from './catalog.v2.data';
import { generateQuestion } from './generation/question-generator.v2';
import { validateQuestionSchema } from './question-schema';

describe('canonical question schema', () => {
  it('accepts every generated question shape', () => {
    for (const type of finalizedProblemBlueprints)
      for (let index = 0; index < 100; index += 1)
        expect(validateQuestionSchema(generateQuestion(type, index))).toEqual([]);
  });

  it('rejects malformed JSON instead of silently skipping it', () => {
    const valid = generateQuestion(finalizedProblemBlueprints[0]!, 0);
    expect(validateQuestionSchema({ ...valid, expectedAnswer: undefined })).toContain(
      'expectedAnswer must be a tagged object',
    );
    expect(validateQuestionSchema({ ...valid, hints: [] })).toContain(
      'hints must contain three valid entries',
    );
    expect(validateQuestionSchema({ ...valid, contentVersion: '' })).toContain(
      'contentVersion must be a non-empty string',
    );
  });
  it('accepts a 180-degree straight angle and rejects angles above 180 degrees', () => {
    const base = generateQuestion(
      finalizedProblemBlueprints.find((type) => type.id === 'classify-angles')!,
      0,
    );
    const straight = {
      ...base,
      visual: {
        type: 'ANGLE' as const,
        alt: 'Góc bẹt 180 độ.',
        degrees: 180,
      },
    };
    expect(validateQuestionSchema(straight)).toEqual([]);
    expect(
      validateQuestionSchema({
        ...straight,
        visual: { ...straight.visual, degrees: 181 },
      }),
    ).toContain('angle visual is invalid');
  });
});
