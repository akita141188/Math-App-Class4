import type { PracticeSession, SubmitPracticeAnswerResponse } from '@math-app/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { validateStudentAnswer } from '../content/answer-validator';
import { ContentService, toStudentQuestion } from '../content/content.service';
import { CreatePracticeSessionDto } from './create-practice-session.dto';
import { SubmitPracticeAnswerDto } from './submit-practice-answer.dto';

interface InternalSession {
  publicSession: PracticeSession;
  questionIds: string[];
}

@Injectable()
export class PracticeService {
  private readonly sessions = new Map<string, InternalSession>();
  private nextSessionNumber = 1;

  constructor(private readonly contentService: ContentService) {}

  create(input: CreatePracticeSessionDto): PracticeSession {
    const allProblemTypes = new Set(this.contentService.getProblemTypes().map((item) => item.id));
    if (
      input.problemTypeIds.length === 0 ||
      input.problemTypeIds.some((id) => !allProblemTypes.has(id))
    ) {
      throw new BadRequestException('Có dạng toán không hợp lệ.');
    }
    const groups = input.problemTypeIds.map((problemTypeId) =>
      this.contentService.getFullQuestions({
        problemTypeIds: [problemTypeId],
        difficulty: input.difficulty,
        limit: input.questionCount,
      }),
    );
    const selectedQuestions = [];
    for (let variant = 0; selectedQuestions.length < input.questionCount; variant += 1) {
      let added = false;
      for (const group of groups) {
        const question = group[variant];
        if (question && selectedQuestions.length < input.questionCount) {
          selectedQuestions.push(question);
          added = true;
        }
      }
      if (!added) break;
    }
    if (selectedQuestions.length === 0) {
      throw new BadRequestException('Không có câu hỏi phù hợp với lựa chọn.');
    }

    const id = `practice-${this.nextSessionNumber++}`;
    const selectedProblemTypeSet = new Set(input.problemTypeIds);
    const selectedTopicIds = [
      ...new Set(
        this.contentService
          .getProblemTypes()
          .filter((item) => selectedProblemTypeSet.has(item.id))
          .map((item) => item.topicId),
      ),
    ];
    const publicSession: PracticeSession = {
      id,
      selectedGrade: input.grade,
      selectedProblemTypes: input.problemTypeIds,
      selectedTopicIds,
      difficulty: input.difficulty,
      mode: input.mode,
      questionCount: selectedQuestions.length,
      requestedQuestionCount: input.questionCount,
      availableQuestionCount: selectedQuestions.length,
      contentVersion: 'legacy-grade4-v1',
      startedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      correctCount: 0,
      hintUsage: 0,
      attempts: [],
      mistakes: [],
      completed: false,
      questions: selectedQuestions.map(toStudentQuestion),
    };
    this.sessions.set(id, {
      publicSession,
      questionIds: selectedQuestions.map((question) => question.id),
    });
    return publicSession;
  }

  get(id: string): PracticeSession {
    return this.getInternal(id).publicSession;
  }

  answer(id: string, input: SubmitPracticeAnswerDto): SubmitPracticeAnswerResponse {
    const session = this.getInternal(id);
    const expectedQuestionId = session.questionIds[session.publicSession.currentQuestionIndex];
    if (expectedQuestionId !== input.questionId) {
      throw new BadRequestException('Câu trả lời không khớp câu hỏi hiện tại.');
    }
    const question = this.contentService.getQuestionById(input.questionId);
    if (!question) throw new NotFoundException('Không tìm thấy câu hỏi.');

    const result = validateStudentAnswer(question, input.answer);
    const previousHintCount = session.publicSession.attempts
      .filter((attempt) => attempt.questionId === input.questionId)
      .reduce((maximum, attempt) => Math.max(maximum, attempt.hintCount), 0);
    session.publicSession.hintUsage += Math.max(0, input.hintCount - previousHintCount);
    const answeredAt = new Date().toISOString();
    session.publicSession.attempts.push({
      questionId: input.questionId,
      correct: result.correct,
      hintCount: input.hintCount,
      misconception: result.misconception,
      answeredAt,
    });
    if (!result.correct && result.misconception) {
      session.publicSession.mistakes.push({
        questionId: input.questionId,
        skillId: question.skillId,
        misconception: result.misconception,
        occurredAt: answeredAt,
      });
    }
    if (result.correct) {
      session.publicSession.correctCount += 1;
      session.publicSession.currentQuestionIndex += 1;
      session.publicSession.completed =
        session.publicSession.currentQuestionIndex >= session.publicSession.questionCount;
    }
    return {
      result,
      currentQuestionIndex: session.publicSession.currentQuestionIndex,
      correctCount: session.publicSession.correctCount,
      completed: session.publicSession.completed,
    };
  }

  private getInternal(id: string): InternalSession {
    const session = this.sessions.get(id);
    if (!session) throw new NotFoundException('Không tìm thấy phiên luyện tập.');
    return session;
  }
}
