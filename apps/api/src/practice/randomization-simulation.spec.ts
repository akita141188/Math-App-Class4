import { questionBank } from '../content/question-bank.v2.data';
import { simulateRotation } from './randomization-simulation';

describe('practice randomization simulation', () => {
  it('runs repeated sessions for every leaf without duplicates or immediate repeats', () => {
    const leafIds = [...new Set(questionBank.map((question) => question.problemTypeId))];
    let simulations = 0;
    let duplicateIds = 0;
    let duplicateFingerprints = 0;
    let immediateRepeats = 0;
    for (const leafId of leafIds) {
      const result = simulateRotation(
        questionBank.filter((question) => question.problemTypeId === leafId),
        20,
        5,
      );
      simulations += result.sessions;
      duplicateIds += result.duplicateIdsWithinSessions;
      duplicateFingerprints += result.duplicateFingerprintsWithinSessions;
      immediateRepeats += result.immediateRepeatIncidents;
      expect(result.uniqueQuestionsReached).toBe(100);
    }
    expect(simulations).toBe(1280);
    expect(duplicateIds).toBe(0);
    expect(duplicateFingerprints).toBe(0);
    expect(immediateRepeats).toBe(0);
  });
});
