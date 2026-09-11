import { ArrowRight, Camera, Keyboard, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

export function SolveLandingPage() {
  return (
    <PageContainer className="narrow-page">
      <header className="page-intro">
        <span className="page-kicker">
          <Sparkles size={18} aria-hidden="true" /> Giải bài cùng thầy
        </span>
        <h1>Em có bài toán nào cần giúp?</h1>
        <p>Chọn cách đưa đề bài vào. Thầy sẽ cùng em tìm hiểu từng bước.</p>
      </header>
      <div className="choice-grid">
        <Link className="big-choice choice-photo" to="/solve/photo">
          <span className="big-choice-icon">
            <Camera size={34} aria-hidden="true" />
          </span>
          <span>
            <strong>Chụp bài toán</strong>
            <small>Chọn ảnh rõ, đủ cả đề bài</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="big-choice choice-text" to="/solve/text">
          <span className="big-choice-icon">
            <Keyboard size={34} aria-hidden="true" />
          </span>
          <span>
            <strong>Nhập bài toán</strong>
            <small>Gõ hoặc dán nội dung đề bài</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <p className="helper-note">
        Không sao nếu em chưa biết bắt đầu thế nào — mình sẽ đọc đề cùng nhau.
      </p>
    </PageContainer>
  );
}
