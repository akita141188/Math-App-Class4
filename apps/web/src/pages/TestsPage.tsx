import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ClipboardCheck,
  Clock3,
  Layers3,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createTestAttempt, getTestBlueprints } from '../api/client';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';

const testTones = ['blue', 'orange', 'green', 'violet', 'gold'];

const testCoverByBlueprint: Record<string, string> = {
  'mid-term-1': '/assets/redesign/test-cover-mid-term-1.webp',
  'end-term-1': '/assets/redesign/test-cover-end-term-1.webp',
  'mid-term-2': '/assets/redesign/test-cover-mid-term-2.webp',
  'end-year': '/assets/redesign/test-cover-end-year.webp',
  comprehensive: '/assets/redesign/test-cover-comprehensive.webp',
};

export function TestsPage() {
  const navigate = useNavigate();
  const blueprints = useQuery({ queryKey: ['test-blueprints'], queryFn: getTestBlueprints });
  const create = useMutation({
    mutationFn: (blueprintId: string) =>
      createTestAttempt({
        blueprintId,
        recentQuestionIds: localLearningHistoryRepository
          .list('TEST')
          .flatMap((record) => record.questionResults.map((result) => result.questionId))
          .slice(0, 200),
      }),
    onSuccess: (attempt) => navigate(`/tests/attempt/${attempt.id}`),
  });
  return (
    <PageContainer className={'tests-page redesign-tests'}>
      <section className={'tests-hero'}>
        <div>
          <span className={'hero-kicker'}>Kiểm tra Toán lớp 4</span>
          <h1>Tự đánh giá kiến thức Toán lớp 4</h1>
          <p>
            Làm bài để biết mình đang tiến bộ đến đâu. Điểm và đáp án chỉ hiện sau khi em nộp bài.
          </p>
          <span className={'hero-rule'}>
            <ShieldCheck size={17} /> Không có gợi ý khi đang làm
          </span>
        </div>
        <img src={'/assets/redesign/test-hero.webp'} alt={''} aria-hidden={'true'} />
      </section>

      <div className={'section-heading redesign-section-heading test-list-heading'}>
        <div>
          <span className={'section-number'}>
            <ClipboardCheck size={17} />
          </span>
          <h2>Danh sách bài kiểm tra</h2>
        </div>
        <p>Chọn một bài phù hợp để bắt đầu</p>
      </div>

      {blueprints.isLoading ? (
        <div className={'catalog-loading'}>
          <LoaderCircle className={'spin'} /> Đang tải đề…
        </div>
      ) : (
        <div className={'test-blueprint-grid redesign-test-grid'}>
          {blueprints.data?.map((blueprint, index) => (
            <article
              key={blueprint.id}
              className={`test-blueprint-card redesign-test-card test-tone-${testTones[index % testTones.length]}`}
            >
              <div className={'test-card-cover'} aria-hidden={'true'}>
                <img
                  src={
                    testCoverByBlueprint[blueprint.id] ??
                    `/assets/redesign/test-cover-${testTones[index % testTones.length]}.webp`
                  }
                  alt={''}
                />
                <span>{blueprint.title}</span>
              </div>
              <span className={'score-badge'}>
                <Trophy size={15} /> Thang điểm {blueprint.totalScore}
              </span>
              <h2>{blueprint.title}</h2>
              <p>{blueprint.description}</p>
              <div className={'test-card-meta'}>
                <span>
                  <ClipboardCheck size={17} /> {blueprint.questionCount} câu
                </span>
                <span>
                  <Clock3 size={17} />{' '}
                  {blueprint.durationMinutes
                    ? `${blueprint.durationMinutes} phút`
                    : 'Không giới hạn'}
                </span>
                <span>
                  <Layers3 size={17} /> {blueprint.topicCoverage.length} nhóm
                </span>
              </div>
              <Button onClick={() => create.mutate(blueprint.id)} disabled={create.isPending}>
                Bắt đầu làm bài <ArrowRight size={18} />
              </Button>
            </article>
          ))}
        </div>
      )}

      <section className={'test-rules-panel'}>
        <div className={'rules-title'}>
          <Sparkles size={25} />
          <div>
            <strong>Quy định khi làm bài kiểm tra</strong>
            <small>Đọc kỹ để kết quả phản ánh đúng khả năng của em.</small>
            <small className={'scoring-note'}>
              Cách tính điểm: Mỗi câu 0,5 điểm · điểm cuối làm tròn số nguyên
            </small>
          </div>
        </div>
        <div className={'rule-item'}>
          <span>01</span>
          <div>
            <strong>Không có gợi ý</strong>
            <small>Em tự suy nghĩ và có thể đổi đáp án trước khi nộp.</small>
          </div>
        </div>
        <div className={'rule-item'}>
          <span>02</span>
          <div>
            <strong>Hiển thị điểm sau khi nộp</strong>
            <small>Kết quả được chấm khi em hoàn thành toàn bộ bài.</small>
          </div>
        </div>
        <div className={'rule-item'}>
          <span>03</span>
          <div>
            <strong>Xem lại bài làm</strong>
            <small>Em có thể xem lại đáp án và phần giải thích sau đó.</small>
          </div>
        </div>
      </section>
      {create.isError && (
        <p className={'error-text'}>
          {create.error instanceof Error ? create.error.message : 'Chưa tạo được đề.'}
        </p>
      )}
    </PageContainer>
  );
}
