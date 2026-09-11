import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { HomePage } from '../pages/HomePage';
import { LearningSessionPage } from '../pages/LearningSessionPage';
import { MePage } from '../pages/MePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ParentPage } from '../pages/ParentPage';
import { PhotoSolvePage } from '../pages/PhotoSolvePage';
import { ReviewPage } from '../pages/ReviewPage';
import { SolveLandingPage } from '../pages/SolveLandingPage';
import { TextSolvePage } from '../pages/TextSolvePage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="solve" element={<SolveLandingPage />} />
            <Route path="solve/text" element={<TextSolvePage />} />
            <Route path="solve/photo" element={<PhotoSolvePage />} />
            <Route path="learn/session" element={<LearningSessionPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="me" element={<MePage />} />
            <Route path="parent" element={<ParentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
