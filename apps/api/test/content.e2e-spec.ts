import type {
  CurriculumCatalog,
  ExpectedAnswer,
  StudentAnswer,
  StudentQuestion,
} from '@math-app/shared';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { validateStudentAnswer } from '../src/content/answer-validator';
import { finalizedSkills } from '../src/content/catalog.v2-derived';
import { auditBank, auditQuestion, contentStats } from '../src/content/content-quality.v2';
import { seededRandom } from '../src/content/generation/content-math';
import { questionBank } from '../src/content/question-bank.v2.data';
import { selectRotatingPracticeQuestions } from '../src/practice/rotating-practice-selector';

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

describe('Grade 4 content', () => {
  it('passes all content integrity checks', () => {
    expect(auditBank(questionBank)).toEqual([]);
  });

  it('meets the promised breadth and format mix', () => {
    const stats = contentStats(questionBank);
    expect(stats).toMatchObject({
      domains: 7,
      topics: 14,
      skills: 64,
      selectableLeafTypes: 64,
      totalQuestions: 6400,
      minimumQuestionsPerType: 100,
      maximumQuestionsPerType: 100,
      leafTypesBelow100: 0,
      leafTypesAbove100: 0,
    });
    expect(stats.countsByFormat.MULTIPLE_CHOICE).toBeGreaterThanOrEqual(500);
  });

  it('does not reuse an identical student-visible question', () => {
    const visibleOwners = new Map<string, string[]>();
    for (const question of questionBank) {
      const signature = JSON.stringify({
        stem: question.stem,
        format: question.format,
        visual: question.visual ?? null,
        options: question.options ?? null,
        orderingItems: question.orderingItems ?? null,
        matchingPairs: question.matchingPairs ?? null,
      });
      visibleOwners.set(signature, [...(visibleOwners.get(signature) ?? []), question.id]);
    }
    const duplicated = [...visibleOwners.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([signature, ids]) => ({ signature, ids }));
    expect(duplicated).toEqual([]);
  });

  it.each([
    ['read-write-numbers', /đọc là|viết số/i],
    ['unknown-addend', /□/],
    ['unknown-subtraction-part', /□/],
    ['multiplication-facts', /×|nhóm|tích/i],
    ['multiply-one-digit', /nhân|×|nhóm|thùng|tích/i],
    ['multiply-two-digits', /nhân|×|nhóm|thùng|tích/i],
    ['read-write-fraction', /tử số|mẫu số|đọc phân số/i],
    ['equivalent-fractions', /bằng|tương đương/i],
    ['compare-fractions', /so sánh|lớn hơn|bé hơn/i],
  ])('uses problem-specific wording for %s', (problemTypeId, expectedWording) => {
    const questions = questionBank.filter((question) => question.problemTypeId === problemTypeId);
    expect(questions).toHaveLength(100);
    expect(questions.every((question) => expectedWording.test(question.stem))).toBe(true);
  });

  it('provides common-error metadata for every mapped skill', () => {
    const catalogSkills = questionBank.map((question) => question.skillId);
    expect(new Set(catalogSkills).size).toBeGreaterThanOrEqual(30);
    expect(questionBank.every((question) => question.commonErrors.length > 0)).toBe(true);
  });

  it('maps skill prerequisites and misconception metadata to reviewed questions', () => {
    expect(finalizedSkills.every((skill) => skill.misconceptionCodes.length > 0)).toBe(true);
    for (const question of questionBank) {
      const skill = finalizedSkills.find((item) => item.id === question.skillId);
      expect(skill).toBeDefined();
      expect(skill?.misconceptionCodes).toContain(question.commonErrors[0]?.code);
    }
  });

  it('deterministically validates the reviewed answer for every seed question', () => {
    for (const question of questionBank) {
      expect(
        validateStudentAnswer(question, correctSubmission(question.expectedAnswer)).correct,
      ).toBe(true);
    }
  });

  it('rejects an ambiguous repeated digit in a place-value question', () => {
    const source = questionBank.find((question) => question.problemTypeId === 'digit-place-value');
    expect(source).toBeDefined();
    if (!source) return;
    const ambiguous = {
      ...source,
      id: 'ambiguous-place-value',
      stem: 'Trong số 44.525, chữ số 4 có giá trị là bao nhiêu?',
    };
    expect(auditQuestion(ambiguous).some((issue) => issue.code === 'AMBIGUOUS_WORDING')).toBe(true);
    expect(
      auditQuestion({
        ...ambiguous,
        stem: 'Trong số 44.525, chữ số 4 ở hàng nghìn có giá trị là bao nhiêu?',
      }).some((issue) => issue.code === 'AMBIGUOUS_WORDING'),
    ).toBe(false);
  });

  it('rejects fraction visuals that contradict the expected fraction', () => {
    const source = questionBank.find(
      (question) =>
        question.problemTypeId === 'identify-fraction' &&
        question.expectedAnswer.kind === 'FRACTION',
    );
    expect(source).toBeDefined();
    if (!source) return;
    const invalid = {
      ...source,
      id: 'invalid-fraction-visual',
      visual: {
        type: 'FRACTION_CIRCLE' as const,
        alt: 'Hình tròn chia bốn phần, tô một phần.',
        equalParts: 4,
        shadedParts: 1,
      },
    };
    expect(auditQuestion(invalid).some((issue) => issue.code === 'VISUAL_MISMATCH')).toBe(true);
    expect(
      auditQuestion({
        ...invalid,
        visual: {
          ...invalid.visual,
          equalParts:
            source.visual?.type === 'FRACTION_CIRCLE' || source.visual?.type === 'FRACTION_BAR'
              ? source.visual.equalParts
              : 6,
          shadedParts:
            source.visual?.type === 'FRACTION_CIRCLE' || source.visual?.type === 'FRACTION_BAR'
              ? source.visual.shadedParts
              : 1,
        },
      }).some((issue) => issue.code === 'VISUAL_MISMATCH'),
    ).toBe(false);
  });

  it('accepts equivalent fractions only when exact teaching form is not required', () => {
    const source = questionBank.find((question) => question.problemTypeId === 'identify-fraction');
    expect(source).toBeDefined();
    if (!source || source.expectedAnswer.kind !== 'FRACTION') return;
    const equivalentQuestion = {
      ...source,
      expectedAnswer: {
        kind: 'FRACTION' as const,
        numerator: 1,
        denominator: 6,
        requireExactForm: false,
      },
    };
    expect(
      validateStudentAnswer(equivalentQuestion, {
        kind: 'FRACTION',
        numerator: 2,
        denominator: 12,
      }).correct,
    ).toBe(true);
    expect(
      validateStudentAnswer(
        {
          ...equivalentQuestion,
          expectedAnswer: { ...equivalentQuestion.expectedAnswer, requireExactForm: true },
        },
        { kind: 'FRACTION', numerator: 2, denominator: 12 },
      ).correct,
    ).toBe(false);
  });
});

describe('Curriculum and practice API', () => {
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

  it('returns the Grade 4 hierarchy without embedding answers', async () => {
    const catalog = await request(server).get('/api/v1/grades/4/catalog').expect(200);
    const catalogBody = catalog.body as CurriculumCatalog;
    expect(catalogBody.domains).toHaveLength(7);
    expect(catalogBody.problemTypes).toHaveLength(64);

    const questions = await request(server)
      .get('/api/v1/questions?problemTypeIds=multiply-one-digit&difficulty=EASY&limit=2')
      .expect(200);
    const questionBody = questions.body as StudentQuestion[];
    expect(questionBody).toHaveLength(2);
    expect(questionBody[0]).not.toHaveProperty('expectedAnswer');
    expect(questionBody[0]).not.toHaveProperty('explanation');
  });

  it('creates and completes a deterministic practice question', async () => {
    const created = await request(server)
      .post('/api/v1/practice-sessions')
      .send({
        grade: 4,
        problemTypeIds: ['multiply-one-digit'],
        difficulty: 'EASY',
        questionCount: 1,
        mode: 'PRACTICE',
      })
      .expect(201);
    const session = created.body as { id: string; questions: Array<{ id: string }> };
    expect(session.questions[0]).not.toHaveProperty('expectedAnswer');
    const selectedQuestion = questionBank.find(
      (question) => question.id === session.questions[0]?.id,
    );
    expect(selectedQuestion).toBeDefined();

    const answered = await request(server)
      .post(`/api/v1/practice-sessions/${session.id}/answer`)
      .send({
        questionId: session.questions[0]?.id,
        answer: correctSubmission(selectedQuestion!.expectedAnswer),
        hintCount: 0,
      })
      .expect(201);
    expect(answered.body).toMatchObject({
      result: { correct: true },
      currentQuestionIndex: 1,
      correctCount: 1,
      completed: true,
    });
  });

  it('rejects invalid practice configuration', async () => {
    await request(server)
      .post('/api/v1/practice-sessions')
      .send({ grade: 4, problemTypeIds: [], questionCount: 0, mode: 'CHAT' })
      .expect(400);
    await request(server)
      .post('/api/v1/practice-sessions')
      .send({
        grade: 4,
        problemTypeIds: ['multiply-one-digit'],
        questionCount: 'everything',
        mode: 'PRACTICE',
      })
      .expect(400);
  });

  it('supports ALL count and all-difficulty multi-type sessions from eligible pools', async () => {
    const allHard = await request(server)
      .post('/api/v1/practice-sessions')
      .send({
        grade: 4,
        problemTypeIds: ['multiply-one-digit'],
        difficulty: 'HARD',
        questionCount: 'ALL',
        mode: 'PRACTICE',
        randomSeed: 'all-hard',
      })
      .expect(201);
    const allHardBody = allHard.body as {
      requestedQuestionCount: number | 'ALL';
      questionCount: number;
      availableQuestionCount: number;
      questions: StudentQuestion[];
    };
    expect(allHardBody).toMatchObject({
      requestedQuestionCount: 'ALL',
      questionCount: 20,
      availableQuestionCount: 20,
    });
    expect(
      allHardBody.questions.every(
        (question: { difficulty: string }) => question.difficulty === 'HARD',
      ),
    ).toBe(true);

    const mixed = await request(server)
      .post('/api/v1/practice-sessions')
      .send({
        grade: 4,
        problemTypeIds: ['multiply-one-digit', 'length-conversion'],
        difficulty: 'ALL',
        questionCount: 10,
        mode: 'PRACTICE',
        randomSeed: 'multi-all',
      })
      .expect(201);
    const mixedBody = mixed.body as { questions: StudentQuestion[] };
    expect(new Set(mixedBody.questions.map((question) => question.problemTypeId))).toEqual(
      new Set(['multiply-one-digit', 'length-conversion']),
    );
    expect(new Set(mixedBody.questions.map((question) => question.difficulty))).toEqual(
      new Set(['EASY', 'MEDIUM', 'HARD']),
    );
  });

  it('submits a canonical 1/6 fraction and rejects incorrect forms', async () => {
    const eligible = questionBank.filter(
      (question) => question.problemTypeId === 'identify-fraction',
    );
    const target = eligible.find(
      (question) =>
        (question.visual?.type === 'FRACTION_CIRCLE' || question.visual?.type === 'FRACTION_BAR') &&
        question.visual.shadedParts === 1 &&
        question.visual.equalParts === 6,
    );
    expect(target).toBeDefined();
    let randomSeed = '';
    for (let index = 0; index < 500 && !randomSeed; index += 1) {
      const seed = `fraction-six-${index}`;
      if (
        selectRotatingPracticeQuestions({
          questions: eligible,
          questionCount: 1,
          rng: seededRandom(seed),
        })[0]?.id === target?.id
      )
        randomSeed = seed;
    }
    expect(randomSeed).not.toBe('');
    const created = await request(server)
      .post('/api/v1/practice-sessions')
      .send({
        grade: 4,
        problemTypeIds: ['identify-fraction'],
        questionCount: 1,
        mode: 'PRACTICE',
        randomSeed,
      })
      .expect(201);
    const session = created.body as { id: string; questions: Array<{ id: string }> };
    const questionId = session.questions[0]?.id;
    expect(questionId).toBe(target?.id);

    for (const answer of [
      { kind: 'FRACTION', numerator: 1, denominator: 5 },
      { kind: 'FRACTION', numerator: 2, denominator: 6 },
    ]) {
      const response = await request(server)
        .post(`/api/v1/practice-sessions/${session.id}/answer`)
        .send({ questionId, answer, hintCount: 0 })
        .expect(201);
      expect(response.body).toMatchObject({ result: { correct: false }, completed: false });
    }

    const correct = await request(server)
      .post(`/api/v1/practice-sessions/${session.id}/answer`)
      .send({
        questionId,
        answer: { kind: 'FRACTION', numerator: 1, denominator: 6 },
        hintCount: 0,
      })
      .expect(201);
    expect(correct.body).toMatchObject({ result: { correct: true }, completed: true });
  });

  it('retrieves selected topics and sanitized attempt history without double-counting hints', async () => {
    const created = await request(server)
      .post('/api/v1/practice-sessions')
      .send({
        grade: 4,
        problemTypeIds: ['multiply-one-digit', 'length-conversion'],
        questionCount: 2,
        mode: 'LEARN',
      })
      .expect(201);
    const session = created.body as {
      id: string;
      questions: Array<{ id: string }>;
    };
    const questionId = session.questions[0]?.id;
    const selectedQuestion = questionBank.find((question) => question.id === questionId);
    expect(selectedQuestion).toBeDefined();

    await request(server)
      .post(`/api/v1/practice-sessions/${session.id}/answer`)
      .send({ questionId, answer: '0', hintCount: 2 })
      .expect(201);
    await request(server)
      .post(`/api/v1/practice-sessions/${session.id}/answer`)
      .send({
        questionId,
        answer: correctSubmission(selectedQuestion!.expectedAnswer),
        hintCount: 2,
      })
      .expect(201);

    const retrieved = await request(server)
      .get(`/api/v1/practice-sessions/${session.id}`)
      .expect(200);
    const retrievedSession = retrieved.body as {
      selectedTopicIds: string[];
      hintUsage: number;
      attempts: Array<Record<string, unknown>>;
      mistakes: Array<Record<string, unknown>>;
    };
    expect(retrievedSession.selectedTopicIds).toEqual(
      expect.arrayContaining(['multiplication', 'units']) as string[],
    );
    expect(retrievedSession).toMatchObject({
      hintUsage: 2,
      attempts: [
        { questionId, correct: false, hintCount: 2 },
        { questionId, correct: true, hintCount: 2 },
      ],
      mistakes: [
        {
          questionId,
          skillId: selectedQuestion!.skillId,
          misconception: selectedQuestion!.commonErrors[0]!.code,
        },
      ],
    });
    const storedAttempts = retrievedSession.attempts;
    expect(storedAttempts.every((attempt) => !Object.hasOwn(attempt, 'answer'))).toBe(true);
  });

  it('serves a frozen, coaching-free test attempt and locks it after deterministic scoring', async () => {
    const blueprints = await request(server).get('/api/v1/test-blueprints').expect(200);
    expect(blueprints.body as unknown[]).toHaveLength(5);

    const created = await request(server)
      .post('/api/v1/test-attempts')
      .send({ blueprintId: 'comprehensive', randomSeed: 'e2e-test-attempt' })
      .expect(201);
    const attempt = created.body as { id: string; questions: Array<{ id: string }> };
    expect(attempt.questions).toHaveLength(20);
    for (const question of attempt.questions) {
      expect(question).not.toHaveProperty('hints');
      expect(question).not.toHaveProperty('assessmentLevel');
      expect(question).not.toHaveProperty('expectedAnswer');
      expect(question).not.toHaveProperty('explanation');
    }

    const retrieved = await request(server).get(`/api/v1/test-attempts/${attempt.id}`).expect(200);
    const retrievedBody = retrieved.body as { questions: Array<{ id: string }> };
    expect(retrievedBody.questions.map((question) => question.id)).toEqual(
      attempt.questions.map((question) => question.id),
    );
    const firstId = attempt.questions[0]!.id;
    await request(server)
      .put(`/api/v1/test-attempts/${attempt.id}/answers/${firstId}`)
      .send({ answer: 'draft answer' })
      .expect(200);

    const submitted = await request(server)
      .post(`/api/v1/test-attempts/${attempt.id}/submit`)
      .send({ answers: {} })
      .expect(201);
    const submittedBody = submitted.body as {
      status: string;
      result: {
        rawCorrect: number;
        rawIncorrect: number;
        rawUnanswered: number;
        finalScore10: number;
        questionResults: Array<Record<string, unknown>>;
      };
    };
    expect(submittedBody).toMatchObject({
      status: 'SUBMITTED',
      result: { rawCorrect: 0, rawIncorrect: 0, rawUnanswered: 20, finalScore10: 0 },
    });
    expect(submittedBody.result.questionResults[0]).toHaveProperty('correctAnswerSummary');
    await request(server)
      .put(`/api/v1/test-attempts/${attempt.id}/answers/${firstId}`)
      .send({ answer: 'late answer' })
      .expect(400);
  });
});
