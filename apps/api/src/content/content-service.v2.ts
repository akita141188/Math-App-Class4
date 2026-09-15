import type {
  CurriculumCatalog,
  Difficulty,
  ProblemTypeSummary,
  Question,
  StudentQuestion,
} from '@math-app/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { domains, grade4, topics } from './catalog.data';
import { finalizedSkills } from './catalog.v2-derived';
import { finalizedProblemBlueprints } from './catalog.v2.data';
import { auditBank, contentStats } from './content-quality.v2';
import { grade4Kntt2026Curriculum } from './kntt-2026-curriculum';
import { bankManifest, questionBank } from './question-bank.v2.data';

export interface QuestionFilters {
  problemTypeIds?: string[];
  difficulty?: Difficulty;
  limit?: number;
}

export function toStudentQuestion(question: Question): StudentQuestion {
  const {
    expectedAnswer: _expectedAnswer,
    solutionSteps: _solutionSteps,
    commonErrors: _commonErrors,
    explanation: _explanation,
    generatorParams: _generatorParams,
    ...studentQuestion
  } = question;
  void _expectedAnswer;
  void _solutionSteps;
  void _commonErrors;
  void _explanation;
  void _generatorParams;
  return studentQuestion;
}

@Injectable()
export class ContentServiceV2 {
  get contentVersion() {
    return bankManifest.contentVersion;
  }

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
          problemTypeCount: finalizedProblemBlueprints.filter((item) => item.topicId === topic.id)
            .length,
        }))
      : [];
  }

  getProblemTypes(topicId?: string): ProblemTypeSummary[] {
    return finalizedProblemBlueprints
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
      skills: finalizedSkills,
      problemTypes: this.getProblemTypes(),
    };
  }

  getOfficialCurriculum() {
    return grade4Kntt2026Curriculum;
  }

  getFullQuestions(filters: QuestionFilters = {}): Question[] {
    const selectedIds = filters.problemTypeIds?.length ? new Set(filters.problemTypeIds) : null;
    return questionBank
      .filter((question) => !selectedIds || selectedIds.has(question.problemTypeId))
      .filter((question) => !filters.difficulty || question.difficulty === filters.difficulty)
      .slice(0, Math.min(filters.limit ?? questionBank.length, questionBank.length));
  }

  getQuestions(filters: QuestionFilters = {}): StudentQuestion[] {
    return this.getFullQuestions(filters).map(toStudentQuestion);
  }

  getQuestionById(id: string): Question | undefined {
    return questionBank.find((question) => question.id === id);
  }

  validate() {
    const issues = auditBank(questionBank);
    return { valid: issues.length === 0, issues };
  }

  stats() {
    return contentStats(questionBank);
  }
}
