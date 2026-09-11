import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer className="not-found">
      <span aria-hidden="true">?</span>
      <h1>Mình chưa tìm thấy trang này</h1>
      <p>Em quay về trang chủ rồi chọn lại nhé.</p>
      <Link className="button button-primary" to="/">
        <Home size={19} aria-hidden="true" /> Về trang chủ
      </Link>
    </PageContainer>
  );
}
