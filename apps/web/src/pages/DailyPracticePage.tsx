import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGradeCatalog } from '../api/client';
import { PageContainer } from '../components/PageContainer';
import { buildDailyProblemTypeIds } from '../features/progress/practiceRecommendations';
import { localProgressRepository } from '../features/progress/progressRepository';

export function DailyPracticePage() {
  const catalogQuery = useQuery({
    queryKey: ['grade-catalog', 4],
    queryFn: () => getGradeCatalog(4),
  });
  const dailyTypes = catalogQuery.data
    ? buildDailyProblemTypeIds(localProgressRepository.getSummary(), catalogQuery.data)
    : [];
  const url = `/practice?types=${dailyTypes.join(',')}&difficulty=MEDIUM&mode=PRACTICE&count=10`;
  return (
    <PageContainer>
      <section className={'daily-card'}>
        <CalendarCheck aria-hidden={'true'} />
        <span className={'page-kicker'}>Bài tập hôm nay</span>
        <h1>10 câu vừa sức, đủ nhiều dạng</h1>
        <p>Bộ câu hỏi cố định trong ngày để em luyện đều mà không bị quá tải.</p>
        <ul>
          <li>
            <CheckCircle2 /> 3 câu số và phép tính
          </li>
          <li>
            <CheckCircle2 /> 2 bài toán có lời văn
          </li>
          <li>
            <CheckCircle2 /> Đo lường, phân số, hình học và dữ liệu
          </li>
        </ul>
        {catalogQuery.isLoading && <p role={'status'}>Đang chuẩn bị bài phù hợp với em…</p>}
        {catalogQuery.isError && (
          <p className={'gentle-status'} role={'status'}>
            Chưa tải được bài hôm nay. Em thử lại khi máy chủ sẵn sàng nhé.
          </p>
        )}
        {dailyTypes.length > 0 && (
          <Link className={'button button-primary'} to={url}>
            Bắt đầu 10 câu <ArrowRight size={19} />
          </Link>
        )}
      </section>
    </PageContainer>
  );
}
