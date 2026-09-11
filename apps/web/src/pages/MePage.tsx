import { ArrowUpRight, CheckCircle2, Compass, Divide, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';

export function MePage() {
  return (
    <PageContainer>
      <header className="page-intro">
        <span className="page-kicker">Của em</span>
        <h1>Em đang tiến bộ thật đều</h1>
        <p>Nhìn lại điều em đã làm tốt và phần cần chú ý thêm.</p>
      </header>
      <div className="me-layout">
        <section className="progress-story" aria-labelledby="recent-progress">
          <div className="story-heading">
            <span className="story-icon">
              <Sparkles size={22} aria-hidden="true" />
            </span>
            <div>
              <span>7 ngày gần đây</span>
              <h2 id="recent-progress">Tiến bộ gần đây</h2>
            </div>
          </div>
          <div className="progress-highlight">
            <strong>4</strong>
            <span>bài em đã tự tìm ra cách giải</span>
          </div>
          <ul className="simple-timeline">
            <li>
              <CheckCircle2 aria-hidden="true" />
              <span>
                <strong>Hôm nay</strong>Hoàn thành bài nhân có nhớ
              </span>
            </li>
            <li>
              <ArrowUpRight aria-hidden="true" />
              <span>
                <strong>Thứ Tư</strong>Đọc đề toán có lời văn tốt hơn
              </span>
            </li>
            <li>
              <Compass aria-hidden="true" />
              <span>
                <strong>Thứ Hai</strong>Biết kiểm tra lại đáp số
              </span>
            </li>
          </ul>
        </section>
        <section className="mistake-note" aria-labelledby="common-mistakes">
          <span className="note-pin" aria-hidden="true" />
          <Divide size={30} aria-hidden="true" />
          <span className="eyebrow">Điều cần nhớ</span>
          <h2 id="common-mistakes">Lỗi em thường gặp</h2>
          <p>Khi chia có dư, em đôi lúc quên kiểm tra xem số dư đã nhỏ hơn số chia chưa.</p>
          <div className="remember-rule">
            <strong>Số dư</strong>
            <span>luôn nhỏ hơn</span>
            <strong>số chia</strong>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
