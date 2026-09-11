import type {
  CurriculumCatalog,
  Difficulty,
  ProblemTypeSummary,
  Question,
  StudentQuestion,
} from '@math-app/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { domains, grade4, problemBlueprints, skills, topics } from './catalog.data';
import { getContentStats, validateContent } from './content-validation';
import { questionBank } from './question-bank.data';

export interface QuestionFilters {
  problemTypeIds?: string[];
  difficulty?: Difficulty;
  limit?: number;
}

export function toStudentQuestion(question: Question): StudentQuestion {
  return {
    id: question.id,
    contentVersion: question.contentVersion,
    templateId: question.templateId,
    fingerprint: question.fingerprint,
    grade: question.grade,
    domainId: question.domainId,
    topicId: question.topicId,
    skillId: question.skillId,
    problemTypeId: question.problemTypeId,
    format: question.format,
    difficulty: question.difficulty,
    assessmentLevel: question.assessmentLevel,
    testEligible: question.testEligible,
    scoreWeight: question.scoreWeight,
    stem: question.stem,
    visual: question.visual,
    options: question.options,
    orderingItems: question.orderingItems,
    matchingPairs: question.matchingPairs,
    hints: question.hints,
    prerequisiteSkillIds: question.prerequisiteSkillIds,
    status: question.status,
    version: question.version,
  };
}

@Injectable()
export class ContentService {
  getGrades() {
    return [grade4];
  }

  getDomains(grade: number) {
    return grade === 4 ? domains : [];
  }

  getTopics(grade: number) {
    return grade === 4
      ? topics.map((topic) => ({
          ...topic,
          problemTypeCount: problemBlueprints.filter((item) => item.topicId === topic.id).length,
        }))
      : [];
  }

  getProblemTypes(topicId?: string): ProblemTypeSummary[] {
    return problemBlueprints
      .filter((item) => !topicId || item.topicId === topicId)
      .map((item) => {
        const questions = questionBank.filter((question) => question.problemTypeId === item.id);
        return {
          id: item.id,
          skillId: `${item.id}-skill`,
          topicId: item.topicId,
          domainId: item.domainId,
          name: item.name,
          description: item.description,
          supportedDifficulties: [...new Set(questions.map((question) => question.difficulty))],
          difficultyCounts: {
            EASY: questions.filter((question) => question.difficulty === 'EASY').length,
            MEDIUM: questions.filter((question) => question.difficulty === 'MEDIUM').length,
            HARD: questions.filter((question) => question.difficulty === 'HARD').length,
          },
          questionCount: questions.length,
          visualQuestionCount: questions.filter((question) => question.visual).length,
        };
      });
  }

  getProblemType(id: string): ProblemTypeSummary {
    const problemType = this.getProblemTypes().find((item) => item.id === id);
    if (!problemType) throw new NotFoundException('Không tìm thấy dạng toán.');
    return problemType;
  }

  getCatalog(): CurriculumCatalog {
    return {
      grade: grade4,
      domains,
      topics: this.getTopics(4),
      skills,
      problemTypes: this.getProblemTypes(),
    };
  }

  getFullQuestions(filters: QuestionFilters = {}): Question[] {
    const selectedIds = filters.problemTypeIds?.length ? new Set(filters.problemTypeIds) : null;
    return questionBank
      .filter((question) => !selectedIds || selectedIds.has(question.problemTypeId))
      .filter((question) => !filters.difficulty || question.difficulty === filters.difficulty)
      .slice(0, Math.min(filters.limit ?? 20, 50));
  }

  getQuestions(filters: QuestionFilters = {}): StudentQuestion[] {
    return this.getFullQuestions(filters).map(toStudentQuestion);
  }

  getQuestionById(id: string): Question | undefined {
    return questionBank.find((question) => question.id === id);
  }

  validate() {
    const issues = validateContent();
    return { valid: issues.length === 0, issues };
  }

  stats() {
    return getContentStats();
  }
}
