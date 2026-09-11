import type { PracticeSession, Question, SubmitPracticeAnswerResponse } from '@math-app/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { validateStudentAnswer } from '../content/answer-validator';
import { ContentServiceV2, toStudentQuestion } from '../content/content-service.v2';
import { expectedAnswerSummary } from '../content/expected-answer-summary';
import { seededRandom } from '../content/generation/content-math';
import { CreatePracticeSessionV2Dto } from './create-practice-session-v2.dto';
import { selectRotatingPracticeQuestions } from './rotating-practice-selector';
import { SubmitPracticeAnswerDto } from './submit-practice-answer.dto';

interface InternalSession {
  publicSession: PracticeSession;
  questionSnapshots: Question[];
}

@Injectable()
export class PracticeServiceV2 {
  private readonly sessions = new Map<string, InternalSession>();
  private nextSessionNumber = 1;

  constructor(private readonly contentService: ContentServiceV2) {}

  create(input: CreatePracticeSessionV2Dto): PracticeSession {
    const allProblemTypes = new Set(this.contentService.getProblemTypes().map((item) => item.id));
    if (
      input.problemTypeIds.length === 0 ||
      input.problemTypeIds.some((id) => !allProblemTypes.has(id))
    )
      throw new BadRequestException('Có dạng toán không hợp lệ.');
    const filteredDifficulty = input.difficulty === 'ALL' ? undefined : input.difficulty;
    const eligible = this.contentService.getFullQuestions({
      problemTypeIds: input.problemTypeIds,
      difficulty: filteredDifficulty,
    });
    const requestedCount = input.questionCount === 'ALL' ? eligible.length : input.questionCount;
    if (requestedCount > eligible.length)
      throw new BadRequestException(`Only ${eligible.length} eligible questions are available.`);
    const seed = input.randomSeed ?? `${Date.now()}-${randomBytes(12).toString('hex')}`;
    const selectedQuestions = selectRotatingPracticeQuestions({
      questions: eligible,
      questionCount: requestedCount,
      difficulty: filteredDifficulty,
      recentQuestions: input.recentQuestions,
      rng: seededRandom(seed),
    });
    if (selectedQuestions.length !== requestedCount)
      throw new BadRequestException(
        `Không đủ câu hỏi phù hợp: cần ${input.questionCount}, chọn được ${selectedQuestions.length}.`,
      );

    const id = `practice-${this.nextSessionNumber++}-${randomBytes(6).toString('hex')}`;
    const publicSession: PracticeSession = {
      id,
      contentVersion: this.contentService.contentVersion,
      selectedGrade: input.grade,
      selectedProblemTypes: input.problemTypeIds,
      selectedTopicIds: [...new Set(selectedQuestions.map((question) => question.topicId))],
      difficulty: input.difficulty,
      mode: input.mode,
      questionCount: selectedQuestions.length,
      requestedQuestionCount: input.questionCount,
      availableQuestionCount: eligible.length,
      startedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      correctCount: 0,
      hintUsage: 0,
      attempts: [],
      mistakes: [],
      completed: false,
      questions: selectedQuestions.map(toStudentQuestion),
    };
    this.sessions.set(id, { publicSession, questionSnapshots: structuredClone(selectedQuestions) });
    return publicSession;
  }

  get(id: string): PracticeSession {
    return this.getInternal(id).publicSession;
  }

  answer(id: string, input: SubmitPracticeAnswerDto): SubmitPracticeAnswerResponse {
    const session = this.getInternal(id);
    const question = session.questionSnapshots[session.publicSession.currentQuestionIndex];
    if (!question || question.id !== input.questionId)
      throw new BadRequestException('Câu trả lời không khớp câu hỏi hiện tại.');
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
    if (!result.correct && result.misconception)
      session.publicSession.mistakes.push({
        questionId: input.questionId,
        skillId: question.skillId,
        misconception: result.misconception,
        occurredAt: answeredAt,
      });
    if (result.correct) {
      session.publicSession.correctCount += 1;
      session.publicSession.currentQuestionIndex += 1;
      session.publicSession.completed =
        session.publicSession.currentQuestionIndex >= session.publicSession.questionCount;
    }
    return {
      result,
      correctAnswerSummary: result.correct ? expectedAnswerSummary(question) : undefined,
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
