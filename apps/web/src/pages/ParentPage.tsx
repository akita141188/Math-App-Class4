import { ArrowLeft, BookOpenCheck, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

export function ParentPage() {
  return (
    <PageContainer className="parent-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={19} aria-hidden="true" /> Về khu vực của con
      </Link>
      <header className="parent-header">
        <div>
          <span className="page-kicker">Dành cho phụ huynh</span>
          <h1>Tuần học của Minh</h1>
          <p>Một vài điều đáng chú ý để gia đình hỗ trợ con đúng lúc.</p>
        </div>
        <div className="week-pill">07–11 tháng 9</div>
      </header>
      <div className="parent-insights">
        <article className="insight-primary">
          <span className="insight-icon">
            <BookOpenCheck size={26} aria-hidden="true" />
          </span>
          <span className="eyebrow">Nên ôn tiếp</span>
          <h2>Phép chia cho số có một chữ số</h2>
          <p>Con đã hiểu cách đặt tính nhưng cần luyện thêm bước ước lượng thương.</p>
        </article>
        <article>
          <span className="insight-icon">
            <TrendingUp size={26} aria-hidden="true" />
          </span>
          <span className="eyebrow">Quan sát trong tuần</span>
          <h2>Con thường nhầm bảng nhân khi thực hiện phép chia</h2>
          <p>Có thể cùng con ôn bảng nhân 6 và 7 trong những khoảng ngắn, mỗi lần 5 phút.</p>
        </article>
      </div>
      <section className="parent-guidance">
        <ShieldCheck size={25} aria-hidden="true" />
        <div>
          <h2>Cách hỗ trợ con</h2>
          <p>
            Hỏi “Con đã biết gì từ đề bài?” trước khi gợi ý phép tính. Cho con thời gian tự thử và
            sửa.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
