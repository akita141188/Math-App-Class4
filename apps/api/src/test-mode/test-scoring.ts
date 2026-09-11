import type { Question, StudentAnswer, TestResult } from '@math-app/shared';
import { validateStudentAnswer } from '../content/answer-validator';
import { topics } from '../content/catalog.data';
import { expectedAnswerSummary } from '../content/expected-answer-summary';

export function isUnanswered(answer: StudentAnswer | undefined): boolean {
  if (answer === undefined || answer === null) return true;
  if (typeof answer === 'string') return answer.trim().length === 0;
  if (Array.isArray(answer)) return answer.length === 0;
  if (typeof answer === 'boolean') return false;
  if ('kind' in answer && answer.kind === 'FRACTION')
    return !Number.isInteger(answer.numerator) || !Number.isInteger(answer.denominator);
  return Object.values(answer as Record<string, string>).every(
    (value) => value.trim().length === 0,
  );
}

export function scoreTestAttempt(
  questions: readonly Question[],
  answers: Readonly<Record<string, StudentAnswer>>,
  startedAt: string,
  submittedAt: string,
): TestResult {
  const possiblePoints = questions.reduce((sum, question) => sum + question.scoreWeight, 0);
  const questionResults = questions.map((question) => {
    const answer = answers[question.id];
    const unanswered = isUnanswered(answer);
    const correct = !unanswered && validateStudentAnswer(question, answer!).correct;
    return {
      questionId: question.id,
      topicId: question.topicId,
      problemTypeId: question.problemTypeId,
      assessmentLevel: question.assessmentLevel,
      correct,
      unanswered,
      pointsEarned: correct ? question.scoreWeight : 0,
      pointsPossible: question.scoreWeight,
      studentAnswer: unanswered ? undefined : answer,
      correctAnswerSummary: expectedAnswerSummary(question),
      explanation: question.explanation,
    };
  });
  const rawCorrect = questionResults.filter((result) => result.correct).length;
  const rawUnanswered = questionResults.filter((result) => result.unanswered).length;
  const rawIncorrect = questions.length - rawCorrect - rawUnanswered;
  const rawPoints = questionResults.reduce((sum, result) => sum + result.pointsEarned, 0);
  const rawPercent = possiblePoints === 0 ? 0 : Math.round((rawPoints / possiblePoints) * 100);
  const finalScore10 = possiblePoints === 0 ? 0 : Math.round((rawPoints / possiblePoints) * 10);
  const topicIds = [...new Set(questions.map((question) => question.topicId))];
  const topicNames = new Map(topics.map((topic) => [topic.id, topic.name]));
  return {
    rawCorrect,
    rawIncorrect,
    rawUnanswered,
    rawPoints,
    possiblePoints,
    rawPercent,
    finalScore10,
    durationSeconds: Math.max(
      0,
      Math.round((Date.parse(submittedAt) - Date.parse(startedAt)) / 1000),
    ),
    topicBreakdown: topicIds.map((topicId) => ({
      topicId,
      topicName: topicNames.get(topicId) ?? topicId,
      questionCount: questionResults.filter((result) => result.topicId === topicId).length,
      correctCount: questionResults.filter((result) => result.topicId === topicId && result.correct)
        .length,
    })),
    questionResults,
  };
}
