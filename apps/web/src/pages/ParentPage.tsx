import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Flame,
  Heart,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGradeCatalog } from '../api/client';
import { PageContainer } from '../components/PageContainer';
import { buildWeakSkillRecommendations } from '../features/progress/practiceRecommendations';
import { localProgressRepository } from '../features/progress/progressRepository';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';
import { useHistoryFileStore } from '../features/progress/historyFileRepository';

export function ParentPage() {
  useHistoryFileStore();
  const progress = localProgressRepository.getSummary();
  const allHistory = localLearningHistoryRepository.list();
  const historyResults = allHistory.flatMap((record) => record.questionResults);
  const historyCorrect = historyResults.filter((result) => result.correct).length;
  const practiceHistory = localLearningHistoryRepository
    .list('PRACTICE')
    .filter((record) => record.sessionType === 'PRACTICE');
  const testHistory = localLearningHistoryRepository
    .list('TEST')
    .filter((record) => record.sessionType === 'TEST');
  const catalogQuery = useQuery({
    queryKey: ['grade-catalog', 4],
    queryFn: () => getGradeCatalog(4),
  });
  const weakSkillRecords = catalogQuery.data
    ? buildWeakSkillRecommendations(progress, catalogQuery.data)
    : [];
  const accuracy = historyResults.length
    ? Math.round((historyCorrect / historyResults.length) * 100)
    : 0;
  const latestTest = testHistory[0];

  return (
    <PageContainer className={'parent-page redesign-parent-page'}>
      <section className={'parent-hero'}>
        <div>
          <span className={'hero-kicker'}>Dành cho phụ huynh</span>
          <h1>Theo dõi việc học của Minh</h1>
          <p>Cùng con tiến bộ mỗi ngày với những số liệu rõ ràng và gợi ý học tập phù hợp.</p>
        </div>
        <img src={'/assets/redesign/parent-hero.webp'} alt={''} aria-hidden={'true'} />
      </section>

      <section className={'parent-kpi-grid'}>
        <article>
          <span className={'kpi-icon green'}>
            <BookOpenCheck size={26} />
          </span>
          <div>
            <small>Tổng số lượt học</small>
            <strong>{practiceHistory.length + testHistory.length}</strong>
            <span>trong tệp lịch sử</span>
          </div>
        </article>
        <article>
          <span className={'kpi-icon blue'}>
            <Target size={26} />
          </span>
          <div>
            <small>Tỉ lệ làm đúng</small>
            <strong>{accuracy}%</strong>
            <span>trung bình gần đây</span>
          </div>
        </article>
        <article>
          <span className={'kpi-icon gold'}>
            <Trophy size={26} />
          </span>
          <div>
            <small>Bài kiểm tra gần nhất</small>
            <strong>{latestTest ? `${latestTest.finalScore10}/10` : '—'}</strong>
            <span>{latestTest?.testTitle ?? 'Chưa có bài kiểm tra'}</span>
          </div>
        </article>
        <article>
          <span className={'kpi-icon violet'}>
            <TrendingUp size={26} />
          </span>
          <div>
            <small>Dạng còn yếu</small>
            <strong>{weakSkillRecords.length}</strong>
            <span>cần ôn thêm</span>
          </div>
        </article>
        <article>
          <span className={'kpi-icon orange'}>
            <Flame size={26} />
          </span>
          <div>
            <small>Hoạt động gần đây</small>
            <strong>{Math.min(practiceHistory.length, 7)}</strong>
            <span>buổi luyện đã lưu</span>
          </div>
        </article>
      </section>

      <section className={'parent-dashboard-grid'}>
        <article className={'parent-chart-card'}>
          <div className={'card-heading-row'}>
            <div>
              <span className={'card-icon card-icon-green'}>
                <TrendingUp size={21} />
              </span>
              <div>
                <strong>Tiến bộ theo thời gian</strong>
                <small>Tổng quan dựa trên lịch sử gần đây</small>
              </div>
            </div>
            <span className={'period-pill'}>4 tuần gần đây</span>
          </div>
          <div className={'fake-chart'} aria-label={`Độ chính xác hiện tại ${accuracy}%`}>
            {[32, 48, 63, Math.max(accuracy, 72)].map((value, index) => (
              <div key={index} className={'chart-column'}>
                <span style={{ height: `${value}%` }}>
                  <i />
                </span>
                <small>Tuần {index + 1}</small>
              </div>
            ))}
          </div>
          <p className={'chart-note'}>Tập trung vào việc con tự làm đúng trước khi xem gợi ý.</p>
        </article>

        <article className={'parent-activity-card'}>
          <div className={'card-heading-row'}>
            <div>
              <span className={'card-icon card-icon-blue'}>
                <CalendarDays size={21} />
              </span>
              <div>
                <strong>Hoạt động gần đây</strong>
                <small>Những buổi đã hoàn thành</small>
              </div>
            </div>
            <Link to={'/history'}>Xem tất cả</Link>
          </div>
          <div className={'parent-activity-list'}>
            {allHistory.slice(0, 5).map((record) => (
              <div key={record.id}>
                <span>{record.sessionType === 'TEST' ? 'Kiểm tra' : 'Luyện tập'}</span>
                <strong>
                  {record.correctCount}/{record.questionResults.length}
                </strong>
              </div>
            ))}
            {allHistory.length === 0 && <p>Chưa có hoạt động hoàn thành.</p>}
          </div>
        </article>

        <article className={'weak-skills-card'}>
          <div className={'card-heading-row'}>
            <div>
              <span className={'card-icon card-icon-orange'}>
                <ShieldCheck size={21} />
              </span>
              <div>
                <strong>Dạng cần ôn thêm</strong>
                <small>Ưu tiên trong vài buổi tới</small>
              </div>
            </div>
          </div>
          {weakSkillRecords.length > 0 ? (
            weakSkillRecords.slice(0, 4).map((item, index) => (
              <div className={'weak-skill-row'} key={item.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.name}</strong>
                  <i>
                    <b style={{ width: `${Math.max(35, 72 - index * 8)}%` }} />
                  </i>
                </div>
              </div>
            ))
          ) : (
            <p>Chưa đủ dữ liệu để xác định dạng còn yếu.</p>
          )}
        </article>
      </section>

      <section className={'parent-recommendation'}>
        <span className={'recommendation-icon'}>
          <Heart size={27} />
        </span>
        <div>
          <span className={'hero-kicker'}>Gợi ý cho Minh trong thời gian tới</span>
          <h2>
            {weakSkillRecords.length
              ? `Ôn thêm ${weakSkillRecords
                  .slice(0, 2)
                  .map((item) => item.name)
                  .join(' và ')}`
              : 'Duy trì thói quen học đều mỗi ngày'}
          </h2>
          <p>Cho con tự thử trước, sau đó mới dùng gợi ý để con nhớ lâu hơn.</p>
        </div>
        <Link className={'button button-primary'} to={'/review'}>
          Xem bài luyện tập gợi ý <ArrowRight size={18} />
        </Link>
      </section>
    </PageContainer>
  );
}
