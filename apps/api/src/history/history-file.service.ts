import type {
  HistoryFileStore,
  HistoryLocalImportRequest,
  InProgressSessionDraft,
  LeafCompletionRecord,
  LearningHistoryRecord,
  PracticeHistoryRecord,
} from '@math-app/shared';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';

const HISTORY_FILE_VERSION = 1 as const;
const HISTORY_RETENTION_LIMIT = 200 as const;
const HISTORY_FILE_DRAFT_LIMIT = 50 as const;
const HISTORY_FILE_RELATIVE_PATH = 'data/history/history.json' as const;

function timestamp(record: LearningHistoryRecord): string {
  return record.sessionType === 'PRACTICE' ? record.completedAt : record.submittedAt;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isHistoryRecord(value: unknown): value is LearningHistoryRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<LearningHistoryRecord>;

  if (
    typeof record.id !== 'string' ||
    typeof record.contentVersion !== 'string' ||
    !Array.isArray(record.questionResults)
  )
    return false;

  if (record.sessionType === 'PRACTICE') {
    const practice = record;
    return (
      typeof practice.startedAt === 'string' &&
      typeof practice.completedAt === 'string' &&
      typeof practice.durationSeconds === 'number' &&
      isStringArray(practice.selectedLeafTypeIds) &&
      isStringArray(practice.selectedTopicIds) &&
      isStringArray(practice.selectedDomainIds) &&
      typeof practice.correctCount === 'number' &&
      typeof practice.incorrectCount === 'number' &&
      typeof practice.unansweredCount === 'number' &&
      typeof practice.accuracyPercent === 'number'
    );
  }

  if (record.sessionType === 'TEST') {
    return (
      typeof record.testBlueprintId === 'string' &&
      typeof record.testTitle === 'string' &&
      typeof record.startedAt === 'string' &&
      typeof record.submittedAt === 'string' &&
      typeof record.durationSeconds === 'number' &&
      typeof record.correctCount === 'number' &&
      typeof record.incorrectCount === 'number' &&
      typeof record.unansweredCount === 'number' &&
      typeof record.rawPercent === 'number' &&
      typeof record.finalScore10 === 'number' &&
      Array.isArray(record.topicBreakdown)
    );
  }

  return false;
}

function isDraft(value: unknown): value is InProgressSessionDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<InProgressSessionDraft>;
  if (
    typeof draft.id !== 'string' ||
    (draft.sessionType !== 'PRACTICE' && draft.sessionType !== 'TEST') ||
    typeof draft.title !== 'string' ||
    typeof draft.startedAt !== 'string' ||
    typeof draft.savedAt !== 'string' ||
    typeof draft.resumePath !== 'string' ||
    typeof draft.currentIndex !== 'number' ||
    typeof draft.totalQuestions !== 'number' ||
    typeof draft.answeredCount !== 'number' ||
    !draft.answers ||
    typeof draft.answers !== 'object'
  )
    return false;

  if (draft.sessionType === 'PRACTICE') {
    return (
      isStringArray(draft.selectedLeafTypeIds) &&
      Boolean(draft.hintLevels) &&
      typeof draft.hintLevels === 'object' &&
      Array.isArray(draft.results)
    );
  }

  return 'testBlueprintId' in draft && typeof draft.testBlueprintId === 'string';
}

function completionFor(
  leafTypeId: string,
  records: readonly PracticeHistoryRecord[],
  prior?: LeafCompletionRecord,
): LeafCompletionRecord {
  const sessions = records.filter((record) => record.selectedLeafTypeIds.includes(leafTypeId));
  const results = sessions.flatMap((record) =>
    record.questionResults.filter((result) => result.leafTypeId === leafTypeId),
  );
  const independent = results.filter((result) => result.hintCount === 0 && !result.unanswered);
  const recent = independent.slice(0, 20);
  const accuracy =
    recent.length === 0 ? 0 : recent.filter((result) => result.correct).length / recent.length;
  const attemptedQuestions = new Set(results.map((result) => result.questionId)).size;
  const qualifies =
    sessions.length >= 2 && attemptedQuestions >= 20 && recent.length >= 15 && accuracy >= 0.8;
  const completedAt = prior?.completedAt ?? (qualifies ? sessions[0]?.completedAt : undefined);
  const status: LeafCompletionRecord['status'] =
    results.length === 0
      ? 'NOT_STARTED'
      : completedAt && recent.length >= 10 && accuracy < 0.6
        ? 'NEEDS_REVIEW'
        : qualifies || completedAt
          ? 'COMPLETED'
          : 'PRACTICING';

  return {
    leafTypeId,
    status,
    attemptedQuestions,
    recentIndependentAccuracy: Math.round(accuracy * 100),
    completedAt,
    lastPracticedAt: sessions[0]?.completedAt,
  };
}

function recomputeCompletions(
  records: readonly LearningHistoryRecord[],
  priorCompletions: readonly LeafCompletionRecord[] = [],
): LeafCompletionRecord[] {
  const practices = records.filter(
    (record): record is PracticeHistoryRecord => record.sessionType === 'PRACTICE',
  );
  const leafIds = new Set([
    ...priorCompletions.map((item) => item.leafTypeId),
    ...practices.flatMap((record) => record.selectedLeafTypeIds),
  ]);
  return [...leafIds].map((leafTypeId) =>
    completionFor(
      leafTypeId,
      practices,
      priorCompletions.find((item) => item.leafTypeId === leafTypeId),
    ),
  );
}

@Injectable()
export class HistoryFileService {
  private readonly filePath =
    process.env.MATH_APP_HISTORY_FILE?.trim() ||
    resolve(__dirname, '../../../../', HISTORY_FILE_RELATIVE_PATH);

  getStore(): HistoryFileStore {
    return this.readStore();
  }

  getDraft(id: string, sessionType?: 'PRACTICE' | 'TEST'): InProgressSessionDraft | undefined {
    const draft = this.readStore().inProgress.find(
      (item) => item.id === id && (!sessionType || item.sessionType === sessionType),
    );
    return draft ? structuredClone(draft) : undefined;
  }

  saveRecord(input: unknown): HistoryFileStore {
    if (!isHistoryRecord(input)) throw new BadRequestException('Lịch sử hoàn thành không hợp lệ.');

    const current = this.readStore();
    const records = [input, ...current.records.filter((record) => record.id !== input.id)]
      .sort((left, right) => timestamp(right).localeCompare(timestamp(left)))
      .slice(0, HISTORY_RETENTION_LIMIT);

    return this.persist(records, current.inProgress, current.completions);
  }

  saveDraft(id: string, input: unknown): HistoryFileStore {
    if (!isDraft(input) || input.id !== id)
      throw new BadRequestException('Bài đang làm dở không hợp lệ.');

    const current = this.readStore();
    const inProgress = [
      input,
      ...current.inProgress.filter(
        (draft) => !(draft.id === input.id && draft.sessionType === input.sessionType),
      ),
    ]
      .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
      .slice(0, HISTORY_FILE_DRAFT_LIMIT);

    return this.persist(current.records, inProgress, current.completions);
  }

  deleteRecord(id: string): HistoryFileStore {
    const current = this.readStore();
    return this.persist(
      current.records.filter((record) => record.id !== id),
      current.inProgress,
    );
  }

  deleteDraft(id: string): HistoryFileStore {
    const current = this.readStore();
    return this.persist(
      current.records,
      current.inProgress.filter((draft) => draft.id !== id),
      current.completions,
    );
  }

  clearAll(): HistoryFileStore {
    return this.persist([], []);
  }

  importLocal(input: unknown): HistoryFileStore {
    if (!input || typeof input !== 'object') return this.readStore();
    const request = input as Partial<HistoryLocalImportRequest>;
    const current = this.readStore();

    const importedRecords = Array.isArray(request.historyStore?.records)
      ? request.historyStore.records.filter(isHistoryRecord)
      : [];
    const importedDrafts = Array.isArray(request.inProgress)
      ? request.inProgress.filter(isDraft)
      : [];

    const recordMap = new Map<string, LearningHistoryRecord>();
    for (const record of [...current.records, ...importedRecords]) {
      const prior = recordMap.get(record.id);
      if (!prior || timestamp(record).localeCompare(timestamp(prior)) > 0)
        recordMap.set(record.id, record);
    }

    const draftMap = new Map<string, InProgressSessionDraft>();
    for (const draft of [...current.inProgress, ...importedDrafts]) {
      const key = `${draft.sessionType}:${draft.id}`;
      const prior = draftMap.get(key);
      if (!prior || draft.savedAt.localeCompare(prior.savedAt) > 0) draftMap.set(key, draft);
    }

    const importedCompletions = Array.isArray(request.historyStore?.completions)
      ? request.historyStore.completions.filter(
          (item): item is LeafCompletionRecord =>
            Boolean(item) && typeof item.leafTypeId === 'string',
        )
      : [];

    return this.persist(
      [...recordMap.values()]
        .sort((left, right) => timestamp(right).localeCompare(timestamp(left)))
        .slice(0, HISTORY_RETENTION_LIMIT),
      [...draftMap.values()]
        .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
        .slice(0, HISTORY_FILE_DRAFT_LIMIT),
      [...current.completions, ...importedCompletions],
    );
  }

  private emptyStore(): HistoryFileStore {
    return {
      version: HISTORY_FILE_VERSION,
      updatedAt: new Date().toISOString(),
      records: [],
      inProgress: [],
      completions: [],
    };
  }

  private readStore(): HistoryFileStore {
    this.ensureDirectory();

    if (!existsSync(this.filePath)) {
      const empty = this.emptyStore();
      this.writeAtomic(empty);
      return empty;
    }

    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8')) as Partial<HistoryFileStore>;
      const records = Array.isArray(parsed.records) ? parsed.records.filter(isHistoryRecord) : [];
      const inProgress = Array.isArray(parsed.inProgress) ? parsed.inProgress.filter(isDraft) : [];

      const priorCompletions = Array.isArray(parsed.completions)
        ? parsed.completions.filter(
            (item): item is LeafCompletionRecord =>
              Boolean(item) && typeof item.leafTypeId === 'string',
          )
        : [];

      return {
        version: HISTORY_FILE_VERSION,
        updatedAt:
          typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
        records: records
          .sort((left, right) => timestamp(right).localeCompare(timestamp(left)))
          .slice(0, HISTORY_RETENTION_LIMIT),
        inProgress: inProgress
          .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
          .slice(0, HISTORY_FILE_DRAFT_LIMIT),
        completions: recomputeCompletions(records, priorCompletions),
      };
    } catch {
      const corruptCopy = `${this.filePath}.corrupt-${Date.now()}.json`;
      try {
        copyFileSync(this.filePath, corruptCopy);
      } catch {
        // Best-effort backup only.
      }
      const empty = this.emptyStore();
      this.writeAtomic(empty);
      return empty;
    }
  }

  private persist(
    records: readonly LearningHistoryRecord[],
    inProgress: readonly InProgressSessionDraft[],
    priorCompletions: readonly LeafCompletionRecord[] = [],
  ): HistoryFileStore {
    const next: HistoryFileStore = {
      version: HISTORY_FILE_VERSION,
      updatedAt: new Date().toISOString(),
      records: [...records],
      inProgress: [...inProgress],
      completions: recomputeCompletions(records, priorCompletions),
    };
    this.writeAtomic(next);
    return next;
  }

  private ensureDirectory(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
  }

  private writeAtomic(store: HistoryFileStore): void {
    this.ensureDirectory();
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');

    try {
      renameSync(tempPath, this.filePath);
    } catch {
      copyFileSync(tempPath, this.filePath);
      rmSync(tempPath, { force: true });
    }
  }
}
