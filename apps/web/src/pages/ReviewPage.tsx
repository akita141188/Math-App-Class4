import { useQuery } from '@tanstack/react-query';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGradeCatalog } from '../api/client';
import { PageContainer } from '../components/PageContainer';
import { buildWeakSkillRecommendations } from '../features/progress/practiceRecommendations';
import { localProgressRepository } from '../features/progress/progressRepository';

const defaultReviewIds = [
  'divide-one-digit-skill',
  'length-conversion-skill',
  'equal-groups-skill',
];

export function ReviewPage() {
  const catalogQuery = useQuery({
    queryKey: ['grade-catalog', 4],
    queryFn: () => getGradeCatalog(4),
  });
  const progress = localProgressRepository.getSummary();
  const weakProblemTypes = catalogQuery.data
    ? buildWeakSkillRecommendations(progress, catalogQuery.data)
    : [];
  const problemTypes =
    weakProblemTypes.length > 0
      ? weakProblemTypes.slice(0, 4)
      : (catalogQuery.data?.problemTypes ?? []).filter((item) =>
          defaultReviewIds.includes(item.skillId),
        );

  return (
    <PageContainer>
      <header className={'page-intro'}>
        <span className={'page-kicker'}>Ôn phần em còn yếu</span>
        <h1>Mỗi ngày vững hơn một chút</h1>
        <p>
          {weakProblemTypes.length > 0
            ? 'Các dạng dưới đây dựa trên những lần em đã thử.'
            : 'Em chưa có nhiều lượt luyện, nên mình bắt đầu bằng ba kỹ năng nền tảng.'}
        </p>
      </header>
      <div className={'review-list'}>
        {problemTypes.map((problemType) => (
          <article className={'review-row'} key={problemType.id}>
            <span className={'review-icon'}>
              <RefreshCw size={24} aria-hidden={'true'} />
            </span>
            <div>
              <h2>{problemType.name}</h2>
              <p>{problemType.description}</p>
            </div>
            <span className={'practice-length'}>5 câu</span>
            <Link to={`/practice?types=${problemType.id}&difficulty=MEDIUM&mode=REVIEW&count=5`}>
              Ôn ngay <ArrowRight size={18} />
            </Link>
          </article>
        ))}
      </div>
      {catalogQuery.isLoading && (
        <div className={'catalog-loading'} role={'status'}>
          Đang chuẩn bị gợi ý ôn tập…
        </div>
      )}
      {catalogQuery.isError && (
        <p className={'gentle-status'} role={'status'}>
          Chưa tải được danh sách ôn tập. Em thử lại sau nhé.
        </p>
      )}
    </PageContainer>
  );
}
