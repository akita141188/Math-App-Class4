import type {
  CheckAnswerRequest,
  CheckAnswerResponse,
  CurriculumTopic,
  DemoProblem,
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
    throw new Error('Không thể kết nối với máy chủ.');
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
