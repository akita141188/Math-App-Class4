import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { historyFileRepository } from '../features/progress/historyFileRepository';

export function HistoryBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    void historyFileRepository.bootstrap();
  }, []);

  return children;
}
