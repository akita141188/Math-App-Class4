import { Divide, History, Lightbulb, Sparkles, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { localProgressRepository } from '../features/progress/progressRepository';
import { localLearningHistoryRepository } from '../features/progress/learningHistoryRepository';

const mistakeLabels: Record<string, string> = {
  ARITHMETIC_SLIP: 'Kiểm tra lại từng bước tính',
  WRONG_OPERATION: 'Đọc kỹ để chọn đúng phép tính',
  PLACE_VALUE_ERROR: 'Chú ý giá trị từng hàng',
  MULTIPLICATION_FACT_GAP: 'Ôn lại bảng nhân',
  DIVISION_FACT_GAP: 'Dùng bảng nhân để kiểm tra phép chia',
  UNIT_CONVERSION_ERROR: 'Đổi về cùng đơn vị trước khi tính',
  QUESTION_MISREAD: 'Đọc kỹ câu hỏi cần tìm gì',
  FRACTION_PART_WHOLE_CONFUSION: 'Đếm đủ số phần bằng nhau của hình',
  GEOMETRY_PROPERTY_CONFUSION: 'Quan sát cạnh và góc của hình',
  PROCEDURE_ERROR: 'Làm từng bước theo đúng thứ tự',
};

export function MePage() {
  const progress = localProgressRepository.getSummary();
  const recentHistory = localLearningHistoryRepository.list().slice(0, 6);
  const recentMistakeCodes = progress.skills.flatMap((skill) => skill.recentMistakes);
  const recentMistakes = [...new Set<string>(recentMistakeCodes)]
    .slice(0, 5)
    .map((code) => mistakeLabels[code] ?? 'Kiểm tra lại dữ kiện');
  const correct = progress.independentCorrect + progress.hintedCorrect;
  const accuracy = progress.totalQuestions
    ? Math.round((correct / progress.totalQuestions) * 100)
    : 0;

  return (
    <PageContainer className={'me-page redesign-me'}>
      <section className={'me-hero'}>
        <div>
          <span className={'hero-kicker'}>Của em · Hành trình học tập</span>
          <h1>Nhìn lại hành trình học</h1>
          <p>Mỗi bài học đều là một bước tiến nhỏ. Cùng xem em đã làm được những gì nhé!</p>
        </div>
        <img src={'/assets/redesign/me-hero.webp'} alt={''} aria-hidden={'true'} />
      </section>

      <section className={'me-dashboard-grid'}>
        <article className={'progress-overview-card'}>
          <div className={'card-heading-row'}>
            <div>
              <span className={'card-icon card-icon-green'}>
                <Sparkles size={22} />
              </span>
              <div>
                <strong>Tổng quan tiến bộ</strong>
                <small>Số liệu được cập nhật trên thiết bị này</small>
              </div>
            </div>
            <span className={'period-pill'}>30 ngày gần đây</span>
          </div>
          <div className={'progress-stat-grid'}>
            <div className={'progress-stat stat-blue'}>
              <History size={24} />
              <strong>{progress.totalQuestions}</strong>
              <span>Câu hỏi đã làm</span>
            </div>
            <div className={'progress-stat stat-green'}>
              <Target size={24} />
              <strong>{progress.independentCorrect}</strong>
              <span>Tự làm đúng</span>
            </div>
            <div className={'progress-stat stat-gold'}>
              <Lightbulb size={24} />
              <strong>{progress.hintedCorrect}</strong>
              <span>Đúng sau gợi ý</span>
            </div>
            <div className={'progress-stat stat-violet'}>
              <Trophy size={24} />
              <strong>{progress.skills.length}</strong>
              <span>Kỹ năng đã luyện</span>
            </div>
          </div>
          <div className={'accuracy-strip'}>
            <span>Độ chính xác gần đây</span>
            <strong>{accuracy}%</strong>
            <div>
              <i style={{ width: `${accuracy}%` }} />
            </div>
          </div>
        </article>

        <article className={'mistakes-card'}>
          <div className={'card-heading-row'}>
            <div>
              <span className={'card-icon card-icon-orange'}>
                <Divide size={22} />
              </span>
              <div>
                <strong>Lỗi em thường gặp</strong>
                <small>Cùng xem để tránh nhé!</small>
              </div>
            </div>
            <Link to={'/review'}>Gợi ý ôn tập</Link>
          </div>
          {recentMistakes.length > 0 ? (
            <ul>
              {recentMistakes.map((mistake, index) => (
                <li key={mistake}>
                  <span>{index + 1}</span>
                  {mistake}
                </li>
              ))}
            </ul>
          ) : (
            <p className={'empty-note'}>
              Luyện thêm vài bộ câu hỏi để ứng dụng nhận ra những điểm em nên chú ý.
            </p>
          )}
        </article>
      </section>

      <section className={'history-showcase'}>
        <div className={'section-heading redesign-section-heading'}>
          <div>
            <span className={'section-number'}>
              <History size={17} />
            </span>
            <h2>Lịch sử học</h2>
          </div>
          <Link to={'/history'}>
            Xem tất cả <span aria-hidden={'true'}>→</span>
          </Link>
        </div>
        {recentHistory.length === 0 ? (
          <div className={'empty-state compact-empty'}>
            <h3>Chưa có buổi học đã hoàn thành</h3>
            <p>Kết quả mới sẽ xuất hiện ở đây.</p>
          </div>
        ) : (
          <div className={'history-rows'}>
            {recentHistory.map((record) => {
              const total = record.questionResults.length;
              const pct = total ? Math.round((record.correctCount / total) * 100) : 0;
              return (
                <Link to={`/history/${record.id}`} key={record.id} className={'history-row'}>
                  <span
                    className={`history-type-icon ${record.sessionType === 'TEST' ? 'history-test' : 'history-practice'}`}
                  >
                    {record.sessionType === 'TEST' ? '✓' : '✎'}
                  </span>
                  <span className={'history-main'}>
                    <strong>
                      {record.sessionType === 'PRACTICE' ? 'Luyện tập' : record.testTitle}
                    </strong>
                    <small>
                      {record.sessionType === 'PRACTICE' ? `${total} câu luyện` : 'Bài kiểm tra'}
                    </small>
                  </span>
                  <span>{record.correctCount} đúng</span>
                  <span>{record.incorrectCount} sai</span>
                  <span
                    className={`score-circle ${pct >= 80 ? 'good' : pct >= 60 ? 'medium' : 'weak'}`}
                  >
                    {record.sessionType === 'TEST' ? `${record.finalScore10}/10` : `${pct}%`}
                  </span>
                  <span
                    className={`status-pill ${pct >= 80 ? 'status-complete' : 'status-review'}`}
                  >
                    {pct >= 80 ? 'Đã hoàn thành' : 'Cần ôn lại'}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
