import type { Question, RecentQuestionReference } from '@math-app/shared';
import { seededRandom } from '../content/generation/content-math';
import { selectRotatingPracticeQuestions } from './rotating-practice-selector';

export interface RotationSimulationResult {
  sessions: number;
  questionsPerSession: number;
  duplicateIdsWithinSessions: number;
  duplicateFingerprintsWithinSessions: number;
  immediateRepeatIncidents: number;
  uniqueQuestionsReached: number;
}

export function simulateRotation(
  questions: readonly Question[],
  sessions = 10,
  questionsPerSession = 10,
): RotationSimulationResult {
  let history: RecentQuestionReference[] = [];
  const unique = new Set<string>();
  let duplicateIdsWithinSessions = 0;
  let duplicateFingerprintsWithinSessions = 0;
  let immediateRepeatIncidents = 0;
  let previousIds = new Set<string>();
  for (let sessionIndex = 0; sessionIndex < sessions; sessionIndex += 1) {
    const selected = selectRotatingPracticeQuestions({
      questions,
      questionCount: questionsPerSession,
      recentQuestions: history,
      rng: seededRandom(`rotation-simulation-${sessionIndex}`),
    });
    duplicateIdsWithinSessions +=
      selected.length - new Set(selected.map((question) => question.id)).size;
    duplicateFingerprintsWithinSessions +=
      selected.length - new Set(selected.map((question) => question.fingerprint)).size;
    immediateRepeatIncidents += selected.filter((question) => previousIds.has(question.id)).length;
    selected.forEach((question) => unique.add(question.id));
    const lastSeenAt = new Date(Date.UTC(2026, 0, sessionIndex + 1)).toISOString();
    history = [
      ...history,
      ...selected.map((question) => ({
        problemTypeId: question.problemTypeId,
        questionId: question.id,
        fingerprint: question.fingerprint,
        lastSeenAt,
      })),
    ].slice(-100);
    previousIds = new Set(selected.map((question) => question.id));
  }
  return {
    sessions,
    questionsPerSession,
    duplicateIdsWithinSessions,
    duplicateFingerprintsWithinSessions,
    immediateRepeatIncidents,
    uniqueQuestionsReached: unique.size,
  };
}
