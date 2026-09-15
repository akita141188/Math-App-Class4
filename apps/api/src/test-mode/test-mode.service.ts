import type { Question, StudentAnswer, TestAttempt, TestQuestion } from '@math-app/shared';
import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ContentServiceV2, toStudentQuestion } from '../content/content-service.v2';
import { seededRandom } from '../content/generation/content-math';
import { HistoryFileService } from '../history/history-file.service';
import { assembleTestQuestions } from './test-assembler';
import { validateTestBlueprint } from './test-blueprint-validator';
import { testBlueprints } from './test-blueprints';
import { scoreTestAttempt } from './test-scoring';
import type { CreateTestAttemptDto, SubmitTestAttemptDto } from './test-mode.dto';

interface InternalAttempt {
  publicAttempt: TestAttempt;
  questions: Question[];
}

function toTestQuestion(question: Question): TestQuestion {
  const {
    hints: _hints,
    assessmentLevel: _assessmentLevel,
    ...studentQuestion
  } = toStudentQuestion(question);
  void _hints;
  void _assessmentLevel;
  return studentQuestion;
}

@Injectable()
export class TestModeService {
  private readonly attempts = new Map<string, InternalAttempt>();

  constructor(
    private readonly content: ContentServiceV2,
    @Optional() private readonly historyFile?: HistoryFileService,
  ) {}

  listBlueprints() {
    return testBlueprints;
  }

  create(input: CreateTestAttemptDto): TestAttempt {
    const blueprint = testBlueprints.find((item) => item.id === input.blueprintId);
    if (!blueprint) throw new NotFoundException('Không tìm thấy mẫu bài kiểm tra.');
    const bank = this.content.getFullQuestions();
    const issues = validateTestBlueprint(blueprint, bank);
    if (issues.length > 0) throw new BadRequestException(issues);
    const seed = input.randomSeed ?? `${Date.now()}-${randomBytes(12).toString('hex')}`;
    let questions: Question[];
    try {
      questions = assembleTestQuestions(
        blueprint,
        bank,
        seededRandom(seed),
        input.recentQuestionIds ?? [],
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Không thể tạo đề hợp lệ.',
      );
    }
    const publicAttempt: TestAttempt = {
      id: `test-${randomBytes(10).toString('hex')}`,
      blueprintId: blueprint.id,
      title: blueprint.title,
      status: 'IN_PROGRESS',
      contentVersion: this.content.contentVersion,
      startedAt: new Date().toISOString(),
      questions: questions.map(toTestQuestion),
      answers: {},
    };
    this.attempts.set(publicAttempt.id, {
      publicAttempt,
      questions: structuredClone(questions),
    });
    return structuredClone(publicAttempt);
  }

  get(id: string): TestAttempt {
    return structuredClone(this.getInternal(id).publicAttempt);
  }

  updateAnswer(id: string, questionId: string, answer: StudentAnswer): TestAttempt {
    const attempt = this.getInternal(id);
    if (attempt.publicAttempt.status === 'SUBMITTED')
      throw new BadRequestException('Bài kiểm tra đã nộp và không thể sửa đáp án.');
    if (!attempt.questions.some((question) => question.id === questionId))
      throw new BadRequestException('Câu hỏi không thuộc đề đã đóng băng.');
    attempt.publicAttempt.answers[questionId] = answer;
    return structuredClone(attempt.publicAttempt);
  }

  submit(id: string, input: SubmitTestAttemptDto): TestAttempt {
    const attempt = this.getInternal(id);
    if (attempt.publicAttempt.status === 'SUBMITTED')
      throw new BadRequestException('Bài kiểm tra đã được nộp.');
    const allowed = new Set(attempt.questions.map((question) => question.id));
    if (Object.keys(input.answers).some((questionId) => !allowed.has(questionId)))
      throw new BadRequestException('Đáp án chứa câu hỏi không thuộc đề.');
    attempt.publicAttempt.answers = structuredClone(input.answers);
    const submittedAt = new Date().toISOString();
    attempt.publicAttempt.status = 'SUBMITTED';
    attempt.publicAttempt.submittedAt = submittedAt;
    attempt.publicAttempt.result = scoreTestAttempt(
      attempt.questions,
      attempt.publicAttempt.answers,
      attempt.publicAttempt.startedAt,
      submittedAt,
    );
    return structuredClone(attempt.publicAttempt);
  }

  private restoreFromHistory(id: string): InternalAttempt | undefined {
    const draft = this.historyFile?.getDraft(id, 'TEST');
    if (!draft || draft.sessionType !== 'TEST' || !draft.questions?.length) return undefined;

    const questions = draft.questions.map((snapshot) => {
      const question = this.content.getQuestionById(snapshot.questionId);
      if (!question)
        throw new NotFoundException(
          'Không thể khôi phục bài kiểm tra vì nội dung câu hỏi đã thay đổi.',
        );
      return structuredClone(question);
    });

    if (questions.length !== draft.totalQuestions)
      throw new NotFoundException(
        'Không thể khôi phục bài kiểm tra vì bản ghi câu hỏi không đầy đủ.',
      );

    const publicAttempt: TestAttempt = {
      id: draft.id,
      blueprintId: draft.testBlueprintId,
      title: draft.title,
      status: 'IN_PROGRESS',
      contentVersion: this.content.contentVersion,
      startedAt: draft.startedAt,
      questions: questions.map(toTestQuestion),
      answers: structuredClone(draft.answers),
    };

    return {
      publicAttempt,
      questions,
    };
  }

  private getInternal(id: string): InternalAttempt {
    let attempt = this.attempts.get(id);

    if (!attempt) {
      attempt = this.restoreFromHistory(id);
      if (attempt) this.attempts.set(id, attempt);
    }

    if (!attempt) throw new NotFoundException('Không tìm thấy lượt làm bài kiểm tra.');
    return attempt;
  }
}
