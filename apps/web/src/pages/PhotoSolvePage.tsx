import { ArrowLeft, Camera, ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

export function PhotoSolvePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectFile(file: File | undefined) {
    if (!file?.type.startsWith('image/')) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function clearPhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <PageContainer className="form-page">
      <Link to="/solve" className="back-link">
        <ArrowLeft size={19} aria-hidden="true" /> Quay lại
      </Link>
      <header className="page-intro compact">
        <span className="page-kicker">
          <Camera size={18} aria-hidden="true" /> Chụp bài toán
        </span>
        <h1>Thêm ảnh đề bài</h1>
        <p>Ảnh rõ và đủ sáng sẽ giúp mình đọc đề tốt hơn.</p>
      </header>
      <div
        className={preview ? 'photo-dropzone has-photo' : 'photo-dropzone'}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          selectFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          id="problem-photo"
          type="file"
          accept="image/*"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        {preview ? (
          <>
            <img src={preview} alt={'Ảnh đề bài: ' + fileName} />
            <button
              className="remove-photo"
              type="button"
              onClick={clearPhoto}
              aria-label="Xóa ảnh đã chọn"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <p>
              Đã chọn: <strong>{fileName}</strong>
            </p>
          </>
        ) : (
          <label htmlFor="problem-photo">
            <span className="upload-icon">
              <ImagePlus size={32} aria-hidden="true" />
            </span>
            <strong>Chọn ảnh bài toán</strong>
            <span>hoặc kéo ảnh vào đây</span>
            <small>PNG, JPG hoặc WEBP</small>
          </label>
        )}
      </div>
      <div className="privacy-note">
        <strong>Ảnh chỉ dùng trong lúc này.</strong>
        <span>Bản mẫu chưa tải ảnh lên hoặc lưu ảnh của em.</span>
      </div>
    </PageContainer>
  );
}
