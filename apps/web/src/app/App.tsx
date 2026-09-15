import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { HistoryBootstrap } from '../components/HistoryBootstrap';
import { ParentShell } from '../components/ParentShell';
import { DailyPracticePage } from '../pages/DailyPracticePage';
import { HomePage } from '../pages/HomePage';
import { HistoryDetailPage } from '../pages/HistoryDetailPage';
import { HistoryDraftDetailPage } from '../pages/HistoryDraftDetailPage';
import { HistoryPage } from '../pages/HistoryPage';
import { LearnCatalogPage } from '../pages/LearnCatalogPage';
import { LearningSessionPage } from '../pages/LearningSessionPage';
import { MePage } from '../pages/MePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ParentPage } from '../pages/ParentPage';
import { PhotoSolvePage } from '../pages/PhotoSolvePage';
import { PracticeSessionPage } from '../pages/PracticeSessionPage';
import { ReviewPage } from '../pages/ReviewPage';
import { SolveLandingPage } from '../pages/SolveLandingPage';
import { TextSolvePage } from '../pages/TextSolvePage';
import { TestAttemptPage } from '../pages/TestAttemptPage';
import { TestsPage } from '../pages/TestsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HistoryBootstrap>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path={'solve'} element={<SolveLandingPage />} />
              <Route path={'solve/text'} element={<TextSolvePage />} />
              <Route path={'solve/photo'} element={<PhotoSolvePage />} />
              <Route path={'learn'} element={<LearnCatalogPage />} />
              <Route path={'learn/types'} element={<LearnCatalogPage allTypes />} />
              <Route path={'learn/grade/4'} element={<LearnCatalogPage />} />
              <Route path={'learn/grade/4/:domainId'} element={<LearnCatalogPage />} />
              <Route path={'learn/grade/4/:domainId/:topicId'} element={<LearnCatalogPage />} />
              <Route
                path={'learn/grade/4/:domainId/:topicId/:problemTypeId'}
                element={<LearnCatalogPage />}
              />
              <Route path={'learn/session'} element={<LearningSessionPage />} />
              <Route path={'practice'} element={<PracticeSessionPage />} />
              <Route path={'tests'} element={<TestsPage />} />
              <Route path={'tests/attempt/:attemptId'} element={<TestAttemptPage />} />
              <Route
                path={'tests/attempt/:attemptId/review'}
                element={<TestAttemptPage reviewMode />}
              />
              <Route path={'history'} element={<HistoryPage />} />
              <Route path={'history/draft/:draftId'} element={<HistoryDraftDetailPage />} />
              <Route path={'history/:historyId'} element={<HistoryDetailPage />} />
              <Route path={'daily'} element={<DailyPracticePage />} />
              <Route path={'review'} element={<ReviewPage />} />
              <Route path={'me'} element={<MePage />} />
              <Route path={'*'} element={<NotFoundPage />} />
            </Route>
            <Route path={'parent'} element={<ParentShell />}>
              <Route index element={<ParentPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HistoryBootstrap>
    </QueryClientProvider>
  );
}
