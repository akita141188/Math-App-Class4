import type { CurriculumSkill } from '@math-app/shared';
import { misconceptionCodeForFamily } from './catalog.data';
import { finalizedProblemBlueprints } from './catalog.v2.data';

export const finalizedSkills: CurriculumSkill[] = finalizedProblemBlueprints.map((problemType) => ({
  id: `${problemType.id}-skill`,
  topicId: problemType.topicId,
  name: problemType.name,
  prerequisiteSkillIds: [],
  misconceptionCodes: [misconceptionCodeForFamily(problemType.family)],
}));
