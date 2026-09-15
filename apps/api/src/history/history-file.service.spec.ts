import type { PracticeHistoryRecord, PracticeSessionDraft } from '@math-app/shared';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HistoryFileService } from './history-file.service';

describe('HistoryFileService', () => {
  let directory: string;
  let filePath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'math-app-history-'));
    filePath = join(directory, 'history.json');
    process.env.MATH_APP_HISTORY_FILE = filePath;
  });

  afterEach(() => {
    delete process.env.MATH_APP_HISTORY_FILE;
    rmSync(directory, { recursive: true, force: true });
  });

  it('persists completed records and drafts to a portable JSON file', () => {
    const service = new HistoryFileService();
    const record: PracticeHistoryRecord = {
      id: 'practice-1',
      sessionType: 'PRACTICE',
      practiceMode: 'PRACTICE',
      startedAt: '2026-09-15T01:00:00.000Z',
      completedAt: '2026-09-15T01:05:00.000Z',
      durationSeconds: 300,
      contentVersion: 'grade4-v3',
      selectedDomainIds: ['number-and-operations'],
      selectedTopicIds: ['natural-numbers'],
      selectedLeafTypeIds: ['read-write-numbers'],
      difficultyMode: 'ALL',
      requestedQuestionCount: 5,
      actualQuestionCount: 5,
      correctCount: 4,
      incorrectCount: 1,
      unansweredCount: 0,
      accuracyPercent: 80,
      questionResults: [],
    };
    const draft: PracticeSessionDraft = {
      id: 'practice-2',
      sessionType: 'PRACTICE',
      title: 'Luyện tập đang làm dở',
      startedAt: '2026-09-15T02:00:00.000Z',
      savedAt: '2026-09-15T02:02:00.000Z',
      resumePath: '/practice?resume=practice-2',
      currentIndex: 1,
      totalQuestions: 10,
      answeredCount: 1,
      practiceMode: 'PRACTICE',
      selectedLeafTypeIds: ['read-write-numbers'],
      answers: {},
      hintLevels: {},
      results: [],
    };

    service.saveRecord(record);
    service.saveDraft(draft.id, draft);

    expect(existsSync(filePath)).toBe(true);
    expect(service.getStore().records.map((item) => item.id)).toEqual(['practice-1']);
    expect(service.getStore().inProgress.map((item) => item.id)).toEqual(['practice-2']);

    const raw = JSON.parse(readFileSync(filePath, 'utf8')) as {
      records: Array<{ id: string }>;
      inProgress: Array<{ id: string }>;
    };
    expect(raw.records[0]?.id).toBe('practice-1');
    expect(raw.inProgress[0]?.id).toBe('practice-2');
  });

  it('deletes individual items and can clear all user history', () => {
    const service = new HistoryFileService();
    const record: PracticeHistoryRecord = {
      id: 'practice-delete',
      sessionType: 'PRACTICE',
      practiceMode: 'PRACTICE',
      startedAt: '2026-09-15T01:00:00.000Z',
      completedAt: '2026-09-15T01:05:00.000Z',
      durationSeconds: 300,
      contentVersion: 'grade4-v3',
      selectedDomainIds: [],
      selectedTopicIds: [],
      selectedLeafTypeIds: ['read-write-numbers'],
      difficultyMode: 'ALL',
      requestedQuestionCount: 1,
      actualQuestionCount: 1,
      correctCount: 1,
      incorrectCount: 0,
      unansweredCount: 0,
      accuracyPercent: 100,
      questionResults: [],
    };

    service.saveRecord(record);
    expect(service.deleteRecord(record.id).records).toHaveLength(0);
    expect(service.clearAll()).toMatchObject({ records: [], inProgress: [], completions: [] });
  });
});
