import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpenCheck,
  Camera,
  Clock3,
  LibraryBig,
  Lightbulb,
  RefreshCw,
  Rocket,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGradeCatalog } from '../api/client';
import { PageContainer } from '../components/PageContainer';
import { buildContinueProblemType } from '../features/progress/practiceRecommendations';
import { localProgressRepository } from '../features/progress/progressRepository';

const actions = [
  {
    to: '/solve',
    title: 'Giải bài',
    note: 'Nhập đề hoặc chụp bài em đang cần hỗ trợ',
    icon: Camera,
    tone: 'teal',
  },
  {
    to: '/learn/types',
    title: 'Học theo dạng',
    note: 'Chọn một hay nhiều dạng Toán để luyện',
    icon: LibraryBig,
    tone: 'blue',
  },
  {
    to: '/daily',
    title: 'Bài tập hôm nay',
    note: 'Một bộ câu hỏi cân bằng nhiều chủ đề',
    icon: BookOpenCheck,
    tone: 'gold',
  },
  {
    to: '/review',
    title: 'Ôn phần em còn yếu',
    note: 'Ưu tiên những dạng em hay nhầm gần đây',
    icon: RefreshCw,
    tone: 'violet',
  },
];

const featuredTopics = [
  {
    id: 'number-and-operations',
    name: 'Số và phép tính',
    note: 'Cộng, trừ, nhân, chia',
    image: '/assets/redesign/topic-numbers.webp',
  },
  {
    id: 'fractions',
    name: 'Phân số',
    note: 'Học bằng hình minh họa',
    image: '/assets/redesign/topic-fractions.webp',
  },
  {
    id: 'measurement',
    name: 'Đo lường',
    note: 'Độ dài, thời gian, tiền',
    image: '/assets/redesign/topic-measurement.webp',
  },
  {
    id: 'geometry',
    name: 'Hình học',
    note: 'Góc, chu vi, diện tích',
    image: '/assets/redesign/topic-geometry.webp',
  },
];

export function HomePage() {
  const progress = localProgressRepository.getSummary();
  const catalogQuery = useQuery({
    queryKey: ['grade-catalog', 4],
    queryFn: () => getGradeCatalog(4),
  });
  const continueType = catalogQuery.data
    ? buildContinueProblemType(progress, catalogQuery.data)
    : undefined;
  const accuracy = progress.totalQuestions
    ? Math.round(
        ((progress.independentCorrect + progress.hintedCorrect) / progress.totalQuestions) * 100,
      )
    : 0;
  const progressPercent = Math.max(0, Math.min(100, progress.totalQuestions || 0));

  return (
    <PageContainer className={'home-page redesign-home'}>
      <section className={'home-hero home-hero-v3'} aria-label={'Khám phá Toán lớp 4'}>
        <div className={'home-hero-copy'}>
          <span className={'hero-kicker'}>Học Toán thật vui mỗi ngày</span>
          <h1>
            <span>Chào Minh!</span>
            <span>Hôm nay em muốn học gì?</span>
          </h1>
          <p>Em cứ khám phá, luyện tập và tiến bộ từng ngày nhé!</p>
          <div className={'hero-actions'}>
            <Link
              to={'/learn/types'}
              className={'button button-primary button-large hero-primary-action'}
            >
              <Rocket size={18} /> Học từng bước <ArrowRight size={17} />
            </Link>
            <span className={'button button-secondary button-large hero-secondary-action'}>
              <Lightbulb size={18} /> Tự tin hơn mỗi ngày
            </span>
          </div>
        </div>
        <div className={'home-hero-art'}>
          <img src={'/assets/redesign/home-hero-wide.webp'} alt={'Minh sẵn sàng học Toán'} />
        </div>
      </section>

      <section className={'home-start-section'} aria-labelledby={'start-heading'}>
        <div className={'section-heading redesign-section-heading compact-heading'}>
          <div>
            <span className={'section-number'}>⚡</span>
            <h2 id={'start-heading'}>Bắt đầu học</h2>
          </div>
          <p>Chọn một cách phù hợp với em</p>
        </div>
        <ul className={'action-grid redesign-action-grid'} aria-label={'Cách bắt đầu học'}>
          {actions.map(({ to, title, note, icon: Icon, tone }) => (
            <li key={title}>
              <Link className={`action-tile redesign-action-tile action-${tone}`} to={to}>
                <span className={'action-icon'}>
                  <Icon aria-hidden={'true'} size={26} />
                </span>
                <span className={'action-copy'}>
                  <strong>{title}</strong>
                  <small>{note}</small>
                </span>
                <span className={'tile-arrow'} aria-hidden={'true'}>
                  <ArrowRight size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={'home-middle-grid'}>
        <article className={'continue-card continue-card-v3'}>
          <div
            className={'continue-ring'}
            style={{ '--progress': `${progressPercent}%` } as CSSProperties}
          >
            <span>{progressPercent}%</span>
          </div>
          <div className={'continue-card-copy'}>
            <span className={'hero-kicker'}>Tiếp tục học</span>
            <h2>
              {progress.totalQuestions && continueType
                ? `Luyện tiếp: ${continueType.name}`
                : 'Bắt đầu với phép nhân'}
            </h2>
            <p>
              {progress.totalQuestions
                ? `Em đã hoàn thành ${progress.totalQuestions} lượt kiểm tra.`
                : 'Một bộ câu hỏi ngắn có gợi ý từng bước.'}
            </p>
            <Link
              to={`/practice?types=${continueType?.id ?? 'multiply-one-digit'}&difficulty=EASY&mode=LEARN&count=5`}
              className={'button button-primary'}
            >
              Học tiếp <ArrowRight size={18} />
            </Link>
          </div>
          <img className={'continue-books'} src={'/assets/redesign/continue-books.webp'} alt={''} />
        </article>

        <article className={'home-stats-card'}>
          <div className={'home-stats-heading'}>
            <span className={'stats-title'}>Thành tích gần đây</span>
            <Link to={'/me'}>
              Xem chi tiết <ArrowRight size={15} />
            </Link>
          </div>
          <div className={'mini-stat'}>
            <span className={'mini-stat-icon stat-gold'}>
              <Award size={20} />
            </span>
            <strong>{progress.totalQuestions}</strong>
            <small>Bài đã làm</small>
          </div>
          <div className={'mini-stat'}>
            <span className={'mini-stat-icon stat-green'}>
              <BarChart3 size={20} />
            </span>
            <strong>{accuracy}%</strong>
            <small>Độ chính xác</small>
          </div>
          <div className={'mini-stat'}>
            <span className={'mini-stat-icon stat-orange'}>
              <Clock3 size={20} />
            </span>
            <strong>{progress.skills.length}</strong>
            <small>Kỹ năng đã luyện</small>
          </div>
        </article>
      </section>

      <section className={'home-topics-section'} aria-labelledby={'featured-topics'}>
        <div className={'section-heading redesign-section-heading compact-heading'}>
          <div>
            <span className={'section-number'}>▦</span>
            <h2 id={'featured-topics'}>Các chủ đề lớp 4</h2>
          </div>
          <Link to={'/learn/grade/4'}>
            Xem bản đồ đầy đủ <ArrowRight size={17} />
          </Link>
        </div>
        <div className={'featured-topic-grid redesign-topic-grid'}>
          {featuredTopics.map((topic) => (
            <Link key={topic.id} className={'topic-visual-card'} to={`/learn/grade/4/${topic.id}`}>
              <span className={'topic-image'} aria-hidden={'true'}>
                <img src={topic.image} alt={''} />
              </span>
              <span className={'topic-text'}>
                <strong>{topic.name}</strong>
                <small>{topic.note}</small>
              </span>
              <span className={'topic-go'} aria-hidden={'true'}>
                <ArrowRight size={17} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
