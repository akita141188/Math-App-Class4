import type { ExpectedAnswer, StudentAnswer, StudentQuestion } from '@math-app/shared';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { questionBank } from '../src/content/question-bank.v2.data';

function correctSubmission(answer: ExpectedAnswer): StudentAnswer {
  switch (answer.kind) {
    case 'NUMBER':
      return String(answer.value);
    case 'FRACTION':
      return {
        kind: 'FRACTION',
        numerator: answer.numerator,
        denominator: answer.denominator,
      };
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

describe('non-linear practice navigation', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows solving questions out of order and completes only after all are solved', async () => {
    const created = await request(server)
      .post('/api/v1/practice-sessions')
      .send({
        grade: 4,
        problemTypeIds: ['multiply-one-digit'],
        difficulty: 'EASY',
        questionCount: 3,
        mode: 'PRACTICE',
        randomSeed: 'non-linear-navigation',
      })
      .expect(201);

    const session = created.body as { id: string; questions: StudentQuestion[] };
    expect(session.questions).toHaveLength(3);

    const solve = async (index: number) => {
      const studentQuestion = session.questions[index]!;
      const fullQuestion = questionBank.find((question) => question.id === studentQuestion.id)!;
      return request(server)
        .post(`/api/v1/practice-sessions/${session.id}/answer`)
        .send({
          questionId: studentQuestion.id,
          answer: correctSubmission(fullQuestion.expectedAnswer),
          hintCount: 0,
        })
        .expect(201);
    };

    const second = await solve(1);
    expect(second.body).toMatchObject({
      result: { correct: true },
      correctCount: 1,
      completed: false,
    });

    const first = await solve(0);
    expect(first.body).toMatchObject({
      result: { correct: true },
      correctCount: 2,
      completed: false,
    });

    const last = await solve(2);
    expect(last.body).toMatchObject({
      result: { correct: true },
      correctCount: 3,
      currentQuestionIndex: 3,
      completed: true,
    });
  });
});
