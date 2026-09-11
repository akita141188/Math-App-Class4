import { ArrowRight, BookOpenCheck, Camera, Keyboard, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

const actions = [
  {
    to: '/solve/photo',
    title: 'Chụp bài toán',
    note: 'Dùng ảnh bài tập của em',
    icon: Camera,
    tone: 'teal',
  },
  {
    to: '/solve/text',
    title: 'Nhập bài toán',
    note: 'Gõ đề bài để bắt đầu',
    icon: Keyboard,
    tone: 'blue',
  },
  {
    to: '/review',
    title: 'Bài tập hôm nay',
    note: '3 bài vừa sức với em',
    icon: BookOpenCheck,
    tone: 'gold',
  },
  {
    to: '/review',
    title: 'Ôn phần em còn yếu',
    note: 'Luyện phép chia từng bước',
    icon: RefreshCw,
    tone: 'violet',
  },
];

export function HomePage() {
  return (
    <PageContainer className="home-page">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow">Hôm nay mình học từng bước</span>
          <h1>Chào Minh! Em muốn bắt đầu từ đâu?</h1>
          <p>Em cứ suy nghĩ trước. Khi cần, thầy sẽ gợi ý vừa đủ.</p>
        </div>
        <div className="math-stamp" aria-hidden="true">
          <span>245 × 6</span>
          <strong>?</strong>
          <i>Em làm được!</i>
        </div>
      </section>

      <section aria-labelledby="start-heading">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <h2 id="start-heading">Bắt đầu học</h2>
          </div>
          <p>Chọn một cách phù hợp với em</p>
        </div>
        <div className="action-grid">
          {actions.map(({ to, title, note, icon: Icon, tone }) => (
            <Link className={'action-tile action-' + tone} to={to} key={title}>
              <span className="action-icon">
                <Icon aria-hidden="true" size={26} />
              </span>
              <span className="action-copy">
                <strong>{title}</strong>
                <small>{note}</small>
              </span>
              <ArrowRight className="action-arrow" aria-hidden="true" size={22} />
            </Link>
          ))}
        </div>
      </section>

      <section className="continue-strip" aria-labelledby="continue-heading">
        <div className="continue-progress" aria-hidden="true">
          <span>2/4</span>
        </div>
        <div>
          <span className="eyebrow">Tiếp tục học</span>
          <h2 id="continue-heading">Nhân với số có một chữ số</h2>
          <p>Em đã đi được nửa chặng rồi.</p>
        </div>
        <Link to="/learn/session" className="button button-secondary">
          Học tiếp <ArrowRight size={19} aria-hidden="true" />
        </Link>
      </section>
    </PageContainer>
  );
}
