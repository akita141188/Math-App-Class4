import type { DifficultyMode, PracticeMode } from '@math-app/shared';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, BookOpen, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGradeCatalog } from '../api/client';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { DifficultyBadge } from '../features/curriculum/DifficultyBadge';
import { ProblemTypeSelector } from '../features/curriculum/ProblemTypeSelector';
import { localProgressRepository } from '../features/progress/progressRepository';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';

interface Props {
  allTypes?: boolean;
}

const difficultyLabels: Record<DifficultyMode, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Vừa sức',
  HARD: 'Nâng cao',
  ALL: 'Tất cả',
};

const modeLabels: Record<PracticeMode, string> = {
  PRACTICE: 'Tự luyện',
  LEARN: 'Học có gợi ý',
  REVIEW: 'Ôn phần còn yếu',
};

export function LearnCatalogPage({ allTypes = false }: Props) {
  const { domainId, topicId, problemTypeId } = useParams();
  const catalogQuery = useQuery({
    queryKey: ['grade-catalog', 4],
    queryFn: () => getGradeCatalog(4),
  });
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('ALL');
  const [mode, setMode] = useState<PracticeMode>('PRACTICE');
  const [questionCount, setQuestionCount] = useState<number | 'ALL'>(10);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const catalog = catalogQuery.data;
  const progress = localProgressRepository.getSummary();

  const visibleProblemTypes = useMemo(() => {
    const normalizedSearch = search.toLocaleLowerCase('vi').trim();
    return (catalog?.problemTypes ?? [])
      .filter((item) => allTypes || !topicId || item.topicId === topicId)
      .filter((item) => !topicFilter || item.topicId === topicFilter)
      .filter(
        (item) =>
          !normalizedSearch ||
          `${item.name} ${item.description}`.toLocaleLowerCase('vi').includes(normalizedSearch),
      );
  }, [allTypes, catalog?.problemTypes, search, topicFilter, topicId]);

  const selectedProblemTypes = (catalog?.problemTypes ?? []).filter((item) =>
    selectedIds.includes(item.id),
  );
  const availableCount = selectedProblemTypes.reduce(
    (sum, item) =>
      sum + (difficulty === 'ALL' ? item.questionCount : item.difficultyCounts[difficulty]),
    0,
  );
  const visibleIds = visibleProblemTypes.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const partiallySelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partiallySelected;
  }, [partiallySelected]);

  useEffect(() => {
    if (typeof questionCount === 'number' && availableCount > 0 && questionCount > availableCount)
      setQuestionCount('ALL');
  }, [availableCount, questionCount]);

  if (catalogQuery.isLoading) {
    return (
      <PageContainer>
        <div className={'catalog-loading'} role={'status'}>
          Đang mở bản đồ Toán lớp 4…
        </div>
      </PageContainer>
    );
  }
  if (!catalog) {
    return (
      <PageContainer>
        <div className={'empty-state'}>
          <h1>Chưa tải được nội dung</h1>
          <p>Em thử lại khi máy chủ đã sẵn sàng nhé.</p>
          <Button onClick={() => void catalogQuery.refetch()}>Thử lại</Button>
        </div>
      </PageContainer>
    );
  }

  if (problemTypeId) {
    const problemType = catalog.problemTypes.find((item) => item.id === problemTypeId);
    if (!problemType)
      return (
        <PageContainer>
          <div className={'empty-state'}>
            <h1>Không tìm thấy dạng toán</h1>
          </div>
        </PageContainer>
      );
    return (
      <PageContainer>
        <Link
          className={'back-link'}
          to={`/learn/grade/4/${problemType.domainId}/${problemType.topicId}`}
        >
          <ArrowLeft size={18} /> Các dạng trong chủ đề
        </Link>
        <article className={'problem-type-detail'}>
          <span className={'page-kicker'}>Dạng Toán lớp 4</span>
          <h1>{problemType.name}</h1>
          <p>{problemType.description}</p>
          <div className={'detail-meta'}>
            <span>{problemType.questionCount} câu đã duyệt</span>
            <span>{problemType.visualQuestionCount} câu có hình</span>
            <span>
              Dễ {problemType.difficultyCounts.EASY} · Vừa sức {problemType.difficultyCounts.MEDIUM}{' '}
              · Nâng cao {problemType.difficultyCounts.HARD}
            </span>
            <span>
              Đã làm{' '}
              {localLearningHistoryRepository.getCompletion(problemType.id).attemptedQuestions} ·{' '}
              {localLearningHistoryRepository.getCompletion(problemType.id).status === 'COMPLETED'
                ? 'Đã hoàn thành'
                : localLearningHistoryRepository.getCompletion(problemType.id).status ===
                    'NEEDS_REVIEW'
                  ? 'Cần ôn lại'
                  : 'Đang luyện'}
            </span>
          </div>
          <div className={'difficulty-list'}>
            {problemType.supportedDifficulties.map((item) => (
              <DifficultyBadge key={item} difficulty={item} />
            ))}
          </div>
          <Link
            className={'button button-primary'}
            to={`/practice?types=${problemType.id}&difficulty=ALL&mode=LEARN&count=10`}
          >
            Học dạng này <ArrowRight size={18} />
          </Link>
        </article>
      </PageContainer>
    );
  }

  if (domainId && !topicId) {
    const domain = catalog.domains.find((item) => item.id === domainId);
    const domainTopics = catalog.topics.filter((item) => item.domainId === domainId);
    return (
      <PageContainer>
        <Link className={'back-link'} to={'/learn/grade/4'}>
          <ArrowLeft size={18} /> Bản đồ lớp 4
        </Link>
        <header className={'page-intro'}>
          <span className={'page-kicker'}>Chủ đề lớn</span>
          <h1>{domain?.name ?? 'Toán lớp 4'}</h1>
          <p>{domain?.description}</p>
        </header>
        <div className={'topic-grid'}>
          {domainTopics.map((topic) => (
            <Link
              key={topic.id}
              className={'topic-card'}
              to={`/learn/grade/4/${domainId}/${topic.id}`}
            >
              <BookOpen aria-hidden={'true'} />
              <strong>{topic.name}</strong>
              <span>{topic.skill}</span>
              <small>{topic.problemTypeCount} dạng Toán</small>
            </Link>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!topicId && !allTypes) {
    return (
      <PageContainer>
        <header className={'page-intro catalog-intro'}>
          <span className={'page-kicker'}>Bản đồ học tập</span>
          <h1>Toán lớp 4 có những gì?</h1>
          <p>Chọn một nhóm kiến thức để xem từng dạng bài. Em không cần học tất cả cùng lúc.</p>
          <Link className={'button button-secondary'} to={'/learn/types'}>
            Xem tất cả các dạng Toán
          </Link>
        </header>
        <div className={'domain-grid'}>
          {catalog.domains.map((domain) => (
            <Link key={domain.id} className={'domain-card'} to={`/learn/grade/4/${domain.id}`}>
              <span className={'domain-order'}>{String(domain.order).padStart(2, '0')}</span>
              <h2>{domain.name}</h2>
              <p>{domain.description}</p>
              <small>
                {domain.topicCount} chủ đề <ArrowRight size={16} />
              </small>
            </Link>
          ))}
        </div>
      </PageContainer>
    );
  }

  const activeTopic = catalog.topics.find((item) => item.id === topicId);
  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  const toggleAllVisible = () =>
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  const effectiveCount = questionCount === 'ALL' ? 'ALL' : Math.min(questionCount, availableCount);
  const practiceUrl = `/practice?types=${selectedIds.join(',')}&difficulty=${difficulty}&mode=${mode}&count=${effectiveCount}`;

  return (
    <PageContainer className={'problem-types-page'}>
      <section className={'catalog-hero'}>
        <img
          className={'catalog-hero-art'}
          src={'/assets/redesign/catalog-hero-wide.webp'}
          alt={''}
          aria-hidden={'true'}
        />
        <div className={'catalog-hero-copy'}>
          <Link
            className={'back-link catalog-back-link'}
            to={activeTopic ? `/learn/grade/4/${activeTopic.domainId}` : '/learn/grade/4'}
          >
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <span className={'page-kicker'}>Các dạng Toán lớp 4</span>
          <h1>{activeTopic?.name ?? 'Chọn dạng em muốn luyện'}</h1>
          <p>
            {activeTopic?.skill ?? 'Tìm kiếm hoặc lọc theo chủ đề, rồi chọn một hay nhiều dạng.'}
          </p>
        </div>
      </section>
      <div className={'catalog-tools'}>
        <label className={'search-field'}>
          <Search size={19} />
          <span className={'sr-only'}>Tìm dạng Toán</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={'Tìm dạng Toán…'}
          />
        </label>
        {allTypes && (
          <label>
            <span className={'sr-only'}>Lọc theo chủ đề</span>
            <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
              <option value={''}>Tất cả chủ đề</option>
              {catalog.topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <label className={'select-all-control'}>
        <input
          ref={selectAllRef}
          type={'checkbox'}
          checked={allVisibleSelected}
          onChange={toggleAllVisible}
        />
        <span>{allTypes ? 'Chọn tất cả kết quả đang hiển thị' : 'Chọn tất cả các dạng'}</span>
      </label>
      <div className={'problem-type-grid'}>
        {visibleProblemTypes.map((problemType) => (
          <ProblemTypeSelector
            key={problemType.id}
            problemType={problemType}
            selected={selectedIds.includes(problemType.id)}
            masteryLevel={(() => {
              const completion = localLearningHistoryRepository.getCompletion(
                problemType.id,
              ).status;
              if (completion === 'COMPLETED') return 'CONFIDENT';
              if (completion === 'NEEDS_REVIEW') return 'NEEDS_REVIEW';
              if (completion === 'PRACTICING') return 'PRACTICING';
              return (
                progress.skills.find((skill) => skill.skillId === problemType.skillId)
                  ?.masteryLevel ?? 'NEW'
              );
            })()}
            onToggle={() => toggle(problemType.id)}
          />
        ))}
      </div>
      {visibleProblemTypes.length === 0 && (
        <div className={'empty-state'}>
          <h2>Chưa tìm thấy dạng phù hợp</h2>
          <p>Em thử từ khóa ngắn hơn nhé.</p>
        </div>
      )}
      <section className={'practice-config'} aria-labelledby={'practice-config-title'}>
        <div>
          <span className={'page-kicker'}>Bắt đầu luyện</span>
          <h2 id={'practice-config-title'}>{selectedIds.length} dạng đã chọn</h2>
          <p>Có {availableCount} câu phù hợp</p>
        </div>
        <label>
          Mức độ
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as DifficultyMode)}
          >
            {Object.entries(difficultyLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cách học
          <select value={mode} onChange={(event) => setMode(event.target.value as PracticeMode)}>
            {Object.entries(modeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Số câu
          <select
            value={availableCount > 0 ? questionCount : ''}
            disabled={availableCount === 0}
            onChange={(event) =>
              setQuestionCount(event.target.value === 'ALL' ? 'ALL' : Number(event.target.value))
            }
          >
            {availableCount === 0 && <option value={''}>Chưa có câu phù hợp</option>}
            {[5, 10, 15, 20, 30, 40, 50]
              .filter((count) => count <= availableCount)
              .map((count) => (
                <option key={count} value={count}>
                  {count} câu
                </option>
              ))}
            {availableCount > 0 && <option value={'ALL'}>Tất cả ({availableCount} câu)</option>}
          </select>
        </label>
        {selectedIds.length > 0 ? (
          <Link className={'button button-primary'} to={practiceUrl}>
            Luyện các dạng đã chọn <ArrowRight size={18} />
          </Link>
        ) : (
          <span className={'selection-reminder'}>Chọn ít nhất một dạng Toán</span>
        )}
      </section>
    </PageContainer>
  );
}
