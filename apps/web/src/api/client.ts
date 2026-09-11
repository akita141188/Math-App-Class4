import type {
  CheckAnswerRequest,
  CheckAnswerResponse,
  CreatePracticeSessionRequest,
  CurriculumCatalog,
  CurriculumTopic,
  DemoProblem,
  PracticeSession,
  SubmitPracticeAnswerRequest,
  SubmitPracticeAnswerResponse,
  TestAttempt,
  TestBlueprint,
  StudentAnswer,
} from '@math-app/shared';

const configuredApiUrl: unknown = import.meta.env.VITE_API_URL;
const apiBase = typeof configuredApiUrl === 'string' ? configuredApiUrl.replace(/\/$/, '') : '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiBase + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = 'Không thể kết nối với máy chủ.';
    try {
      const errorBody = (await response.json()) as { message?: unknown };
      if (typeof errorBody.message === 'string' && errorBody.message.trim()) {
        message = errorBody.message;
      }
    } catch {
      // Keep the safe generic message for non-JSON failures.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getCurriculumTopics(): Promise<CurriculumTopic[]> {
  return request('/api/v1/curriculum/topics');
}

export function getDemoProblem(): Promise<DemoProblem> {
  return request('/api/v1/problems/demo');
}

export function checkDemoAnswer(input: CheckAnswerRequest): Promise<CheckAnswerResponse> {
  return request('/api/v1/learning-sessions/demo/check', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getGradeCatalog(grade = 4): Promise<CurriculumCatalog> {
  return request(`/api/v1/grades/${grade}/catalog`);
}

export function createPracticeSession(
  input: CreatePracticeSessionRequest,
): Promise<PracticeSession> {
  return request('/api/v1/practice-sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function submitPracticeAnswer(
  sessionId: string,
  input: SubmitPracticeAnswerRequest,
): Promise<SubmitPracticeAnswerResponse> {
  return request(`/api/v1/practice-sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getTestBlueprints(): Promise<TestBlueprint[]> {
  return request('/api/v1/test-blueprints');
}

export function createTestAttempt(input: {
  blueprintId: string;
  recentQuestionIds?: string[];
  randomSeed?: string;
}): Promise<TestAttempt> {
  return request('/api/v1/test-attempts', { method: 'POST', body: JSON.stringify(input) });
}

export function getTestAttempt(id: string): Promise<TestAttempt> {
  return request(`/api/v1/test-attempts/${id}`);
}

export function updateTestAnswer(
  id: string,
  questionId: string,
  answer: StudentAnswer,
): Promise<TestAttempt> {
  return request(`/api/v1/test-attempts/${id}/answers/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify({ answer }),
  });
}

export function submitTestAttempt(
  id: string,
  answers: Record<string, StudentAnswer>,
): Promise<TestAttempt> {
  return request(`/api/v1/test-attempts/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}
