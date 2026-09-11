import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';

const example =
  'Một cửa hàng có 245 hộp bánh. Mỗi hộp có 6 chiếc bánh. Hỏi cửa hàng có tất cả bao nhiêu chiếc bánh?';

export function TextSolvePage() {
  const [statement, setStatement] = useState('');
  const navigate = useNavigate();
  const isReady = statement.trim().length >= 10;

  function startLearning() {
    if (isReady) {
      void navigate('/learn/session', { state: { statement: statement.trim() } });
    }
  }

  return (
    <PageContainer className="form-page">
      <Link to="/solve" className="back-link">
        <ArrowLeft size={19} aria-hidden="true" /> Quay lại
      </Link>
      <header className="page-intro compact">
        <span className="page-kicker">Nhập đề bài</span>
        <h1>Gõ bài toán của em</h1>
        <p>Nhớ nhập đủ phần đề bài và câu hỏi nhé.</p>
      </header>
      <div className="input-sheet">
        <label htmlFor="problem-text">Đề bài</label>
        <textarea
          id="problem-text"
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
          rows={7}
          placeholder="Em nhập đề bài vào đây…"
        />
        <div className="input-meta">
          <span>{statement.length} ký tự</span>
          {!isReady && statement.length > 0 && <span>Nhập thêm một chút để đề bài rõ hơn.</span>}
        </div>
        <Button onClick={startLearning} disabled={!isReady}>
          Bắt đầu <ArrowRight size={20} aria-hidden="true" />
        </Button>
      </div>
      <button className="example-problem" type="button" onClick={() => setStatement(example)}>
        <span>Thử đề bài mẫu</span>
        <q>{example}</q>
      </button>
    </PageContainer>
  );
}
