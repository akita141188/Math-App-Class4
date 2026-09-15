import type { PracticeSession, Question, SubmitPracticeAnswerResponse } from '@math-app/shared';
import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { validateStudentAnswer } from '../content/answer-validator';
import { ContentServiceV2, toStudentQuestion } from '../content/content-service.v2';
import { expectedAnswerSummary } from '../content/expected-answer-summary';
import { seededRandom } from '../content/generation/content-math';
import { HistoryFileService } from '../history/history-file.service';
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

  constructor(
    private readonly contentService: ContentServiceV2,
    @Optional() private readonly historyFile?: HistoryFileService,
  ) {}

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

    this.sessions.set(id, {
      publicSession,
      questionSnapshots: structuredClone(selectedQuestions),
    });
    return publicSession;
  }

  get(id: string): PracticeSession {
    return this.getInternal(id).publicSession;
  }

  answer(id: string, input: SubmitPracticeAnswerDto): SubmitPracticeAnswerResponse {
    const session = this.getInternal(id);
    const questionIndex = session.questionSnapshots.findIndex(
      (question) => question.id === input.questionId,
    );
    const question = session.questionSnapshots[questionIndex];

    if (questionIndex < 0 || !question)
      throw new BadRequestException('Câu trả lời không thuộc phiên luyện tập hiện tại.');

    const alreadySolved = session.publicSession.attempts.some(
      (attempt) => attempt.questionId === input.questionId && attempt.correct,
    );
    if (alreadySolved) throw new BadRequestException('Câu này đã được hoàn thành.');

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

    const solvedIds = new Set(
      session.publicSession.attempts
        .filter((attempt) => attempt.correct)
        .map((attempt) => attempt.questionId),
    );

    session.publicSession.correctCount = solvedIds.size;
    session.publicSession.completed = solvedIds.size >= session.publicSession.questionCount;

    if (session.publicSession.completed) {
      session.publicSession.currentQuestionIndex = session.publicSession.questionCount;
    } else if (!result.correct) {
      session.publicSession.currentQuestionIndex = questionIndex;
    } else {
      let nextIndex = questionIndex;
      for (let offset = 1; offset <= session.questionSnapshots.length; offset += 1) {
        const candidateIndex = (questionIndex + offset) % session.questionSnapshots.length;
        const candidate = session.questionSnapshots[candidateIndex];
        if (candidate && !solvedIds.has(candidate.id)) {
          nextIndex = candidateIndex;
          break;
        }
      }
      session.publicSession.currentQuestionIndex = nextIndex;
    }

    return {
      result,
      correctAnswerSummary: result.correct ? expectedAnswerSummary(question) : undefined,
      currentQuestionIndex: session.publicSession.currentQuestionIndex,
      correctCount: session.publicSession.correctCount,
      completed: session.publicSession.completed,
    };
  }

  private restoreFromHistory(id: string): InternalSession | undefined {
    const draft = this.historyFile?.getDraft(id, 'PRACTICE');
    if (!draft || draft.sessionType !== 'PRACTICE' || !draft.questions?.length) return undefined;

    const questionSnapshots = draft.questions.map((snapshot) => {
      const question = this.contentService.getQuestionById(snapshot.questionId);
      if (!question)
        throw new NotFoundException(
          'Không thể khôi phục phiên luyện tập vì nội dung câu hỏi đã thay đổi.',
        );
      return structuredClone(question);
    });

    if (questionSnapshots.length !== draft.totalQuestions)
      throw new NotFoundException(
        'Không thể khôi phục phiên luyện tập vì bản ghi câu hỏi không đầy đủ.',
      );

    const attempts: PracticeSession['attempts'] = [];
    for (const question of questionSnapshots) {
      const state = draft.questionStates?.[question.id];
      const result = draft.results.find((item) => item.questionId === question.id);

      if (state !== 'CORRECT' && state !== 'WRONG' && !result) continue;

      attempts.push({
        questionId: question.id,
        correct: state === 'CORRECT' ? true : state === 'WRONG' ? false : Boolean(result?.correct),
        hintCount: Math.max(draft.hintLevels[question.id] ?? 0, result?.hintCount ?? 0),
        answeredAt: result?.answeredAt ?? draft.savedAt,
      });
    }

    const solvedIds = new Set(
      Object.entries(draft.questionStates ?? {})
        .filter(([, state]) => state === 'CORRECT')
        .map(([questionId]) => questionId),
    );

    if (solvedIds.size === 0) {
      for (const attempt of attempts) if (attempt.correct) solvedIds.add(attempt.questionId);
    }

    const difficulties = [...new Set(questionSnapshots.map((question) => question.difficulty))];
    const selectedProblemTypes =
      draft.selectedLeafTypeIds.length > 0
        ? draft.selectedLeafTypeIds
        : [...new Set(questionSnapshots.map((question) => question.problemTypeId))];

    const publicSession: PracticeSession = {
      id: draft.id,
      selectedGrade: questionSnapshots[0]!.grade,
      selectedProblemTypes,
      selectedTopicIds: [...new Set(questionSnapshots.map((question) => question.topicId))],
      difficulty: difficulties.length === 1 ? difficulties[0]! : 'ALL',
      mode: draft.practiceMode,
      questionCount: questionSnapshots.length,
      requestedQuestionCount: questionSnapshots.length,
      availableQuestionCount: questionSnapshots.length,
      contentVersion: this.contentService.contentVersion,
      startedAt: draft.startedAt,
      currentQuestionIndex: Math.min(
        Math.max(0, draft.currentIndex),
        Math.max(0, questionSnapshots.length - 1),
      ),
      correctCount: solvedIds.size,
      hintUsage: Object.values(draft.hintLevels).reduce((sum, value) => sum + value, 0),
      attempts,
      mistakes: [],
      completed: false,
      questions: questionSnapshots.map(toStudentQuestion),
    };

    return {
      publicSession,
      questionSnapshots,
    };
  }

  private getInternal(id: string): InternalSession {
    let session = this.sessions.get(id);

    if (!session) {
      session = this.restoreFromHistory(id);
      if (session) this.sessions.set(id, session);
    }

    if (!session) throw new NotFoundException('Không tìm thấy phiên luyện tập.');
    return session;
  }
}
