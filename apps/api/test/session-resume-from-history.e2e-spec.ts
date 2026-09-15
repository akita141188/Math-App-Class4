import type {
  InProgressSessionDraft,
  PracticeSessionDraft,
  Question,
  StudentAnswer,
  TestSessionDraft,
} from '@math-app/shared';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { questionBank } from '../src/content/question-bank.v2.data';

function correctAnswer(question: Question): StudentAnswer {
  const answer = question.expectedAnswer;

  switch (answer.kind) {
    case 'NUMBER':
      return String(answer.value);
    case 'FRACTION':
      return { kind: 'FRACTION', numerator: answer.numerator, denominator: answer.denominator };
    case 'TEXT':
      return answer.accepted[0] ?? '';
    case 'OPTION':
      return answer.optionId;
    case 'OPTIONS':
      return answer.optionIds;
    case 'BOOLEAN':
      return answer.value;
    case 'ORDER':
      return answer.itemIds;
    case 'MATCHES':
      return Object.fromEntries(answer.pairs.map((pair) => [pair.leftId, pair.rightId]));
  }
}

function snapshot(question: Question) {
  return {
    questionId: question.id,
    questionSummary: question.stem,
    leafTypeId: question.problemTypeId,
    topicId: question.topicId,
    difficulty: question.difficulty,
    assessmentLevel: question.assessmentLevel,
    format: question.format,
  };
}

describe('resume unfinished sessions through real HTTP routes', () => {
  let app: INestApplication;
  let server: Server;
  let tempDir: string;
  let oldHistoryFile: string | undefined;

  const numeric = questionBank.filter((question) => question.expectedAnswer.kind === 'NUMBER');
  const first = numeric[0]!;
  const second = numeric[1]!;

  beforeAll(async () => {
    tempDir = mkdtempSync(resolve(tmpdir(), 'math-app-resume-e2e-'));
    oldHistoryFile = process.env.MATH_APP_HISTORY_FILE;
    process.env.MATH_APP_HISTORY_FILE = resolve(tempDir, 'history.json');

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();

    if (oldHistoryFile === undefined) delete process.env.MATH_APP_HISTORY_FILE;
    else process.env.MATH_APP_HISTORY_FILE = oldHistoryFile;

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('restores Practice from history.json and can continue the original question set', async () => {
    const id = 'practice-http-restore';
    const draft: PracticeSessionDraft = {
      id,
      sessionType: 'PRACTICE',
      title: 'Luyện tập đang làm dở',
      startedAt: '2026-09-15T08:00:00.000Z',
      savedAt: '2026-09-15T08:05:00.000Z',
      resumePath: `/practice?resume=${id}`,
      currentIndex: 1,
      totalQuestions: 2,
      answeredCount: 2,
      practiceMode: 'PRACTICE',
      selectedLeafTypeIds: [...new Set([first.problemTypeId, second.problemTypeId])],
      answers: {
        [first.id]: correctAnswer(first),
        [second.id]: '__wrong__',
      },
      hintLevels: {
        [first.id]: 0,
        [second.id]: 1,
      },
      results: [
        {
          questionId: first.id,
          leafTypeId: first.problemTypeId,
          topicId: first.topicId,
          difficulty: first.difficulty,
          assessmentLevel: first.assessmentLevel,
          format: first.format,
          correct: true,
          unanswered: false,
          hintCount: 0,
          answeredAt: '2026-09-15T08:02:00.000Z',
          studentAnswer: correctAnswer(first),
          questionSummary: first.stem,
        },
        {
          questionId: second.id,
          leafTypeId: second.problemTypeId,
          topicId: second.topicId,
          difficulty: second.difficulty,
          assessmentLevel: second.assessmentLevel,
          format: second.format,
          correct: false,
          unanswered: false,
          hintCount: 1,
          answeredAt: '2026-09-15T08:04:00.000Z',
          studentAnswer: '__wrong__',
          questionSummary: second.stem,
        },
      ],
      questions: [snapshot(first), snapshot(second)],
      questionStates: {
        [first.id]: 'CORRECT',
        [second.id]: 'WRONG',
      },
    };

    await request(server)
      .put(`/api/v1/history/in-progress/${id}`)
      .send(draft satisfies InProgressSessionDraft)
      .expect(200);

    const restoredResponse = await request(server)
      .get(`/api/v1/practice-sessions/${id}`)
      .expect(200);

    const restored = restoredResponse.body as {
      id: string;
      currentQuestionIndex: number;
      correctCount: number;
      questions: Array<{ id: string }>;
      attempts: Array<{ questionId: string; correct: boolean }>;
    };

    expect(restored.id).toBe(id);
    expect(restored.questions.map((question) => question.id)).toEqual([first.id, second.id]);
    expect(restored.currentQuestionIndex).toBe(1);
    expect(restored.correctCount).toBe(1);
    expect(restored.attempts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ questionId: first.id, correct: true }),
        expect.objectContaining({ questionId: second.id, correct: false }),
      ]),
    );

    const continued = await request(server)
      .post(`/api/v1/practice-sessions/${id}/answer`)
      .send({
        questionId: second.id,
        answer: correctAnswer(second),
        hintCount: 1,
      })
      .expect(201);

    expect(continued.body as unknown).toMatchObject({
      completed: true,
      correctCount: 2,
    });
  });

  it('restores Test from history.json, preserves prior answers, and can continue/submit', async () => {
    const id = 'test-http-restore';
    const draft: TestSessionDraft = {
      id,
      sessionType: 'TEST',
      title: 'Kiểm tra đang làm dở',
      startedAt: '2026-09-15T08:00:00.000Z',
      savedAt: '2026-09-15T08:05:00.000Z',
      resumePath: `/tests/attempt/${id}`,
      currentIndex: 1,
      totalQuestions: 2,
      answeredCount: 1,
      testBlueprintId: 'comprehensive',
      answers: {
        [first.id]: correctAnswer(first),
      },
      questions: [snapshot(first), snapshot(second)],
      questionStates: {
        [first.id]: 'ANSWERED',
        [second.id]: 'WORKING',
      },
    };

    await request(server)
      .put(`/api/v1/history/in-progress/${id}`)
      .send(draft satisfies InProgressSessionDraft)
      .expect(200);

    const restoredResponse = await request(server).get(`/api/v1/test-attempts/${id}`).expect(200);

    const restored = restoredResponse.body as {
      id: string;
      answers: Record<string, StudentAnswer>;
      questions: Array<Record<string, unknown> & { id: string }>;
    };

    expect(restored.id).toBe(id);
    expect(restored.questions.map((question) => question.id)).toEqual([first.id, second.id]);
    expect(restored.answers[first.id]).toEqual(correctAnswer(first));
    expect(restored.questions.every((question) => !Object.hasOwn(question, 'hints'))).toBe(true);
    expect(
      restored.questions.every((question) => !Object.hasOwn(question, 'assessmentLevel')),
    ).toBe(true);

    const updateResponse = await request(server)
      .put(`/api/v1/test-attempts/${id}/answers/${second.id}`)
      .send({ answer: correctAnswer(second) })
      .expect(200);

    const updated = updateResponse.body as { answers: Record<string, StudentAnswer> };
    expect(updated.answers[first.id]).toEqual(correctAnswer(first));
    expect(updated.answers[second.id]).toEqual(correctAnswer(second));

    const submitResponse = await request(server)
      .post(`/api/v1/test-attempts/${id}/submit`)
      .send({
        answers: {
          [first.id]: correctAnswer(first),
          [second.id]: correctAnswer(second),
        },
      })
      .expect(201);

    expect(submitResponse.body as unknown).toMatchObject({
      status: 'SUBMITTED',
      result: {
        rawCorrect: 2,
      },
    });
  });
});
