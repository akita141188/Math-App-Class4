import { finalizedProblemBlueprints } from './catalog.v2.data';
import { grade4Kntt2026Curriculum } from './kntt-2026-curriculum';

describe('Kết nối tri thức Grade 4 curriculum map', () => {
  it('contains exactly 13 chapters and 73 numbered lessons', () => {
    expect(grade4Kntt2026Curriculum.chapters).toHaveLength(13);
    expect(grade4Kntt2026Curriculum.lessons).toHaveLength(73);
    expect(grade4Kntt2026Curriculum.lessons.map((lesson) => lesson.number)).toEqual(
      Array.from({ length: 73 }, (_, index) => index + 1),
    );
  });

  it('maps every lesson to existing practice leaves', () => {
    const known = new Set(finalizedProblemBlueprints.map((item) => item.id));
    const broken = grade4Kntt2026Curriculum.lessons.flatMap((lesson) =>
      lesson.problemTypeIds
        .filter((problemTypeId) => !known.has(problemTypeId))
        .map((problemTypeId) => ({ lesson: lesson.number, problemTypeId })),
    );
    expect(broken).toEqual([]);
  });

  it('keeps the bank at 80 selectable leaves after the 2026 audit', () => {
    expect(finalizedProblemBlueprints).toHaveLength(80);
  });
});
