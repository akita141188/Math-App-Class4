import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SessionExitDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SessionExitDialog({ open, message, onConfirm, onCancel }: SessionExitDialogProps) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  return createPortal(
    <div
      className={'session-exit-backdrop'}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className={'session-exit-dialog'}
        role={'alertdialog'}
        aria-modal={'true'}
        aria-labelledby={'session-exit-title'}
        aria-describedby={'session-exit-message'}
      >
        <button
          type={'button'}
          className={'session-exit-close'}
          onClick={onCancel}
          aria-label={'Đóng hộp thoại'}
        >
          <X size={20} />
        </button>

        <div className={'session-exit-icon'} aria-hidden={'true'}>
          <AlertTriangle size={28} />
        </div>

        <div>
          <span className={'page-kicker'}>Bài đang làm dở</span>
          <h2 id={'session-exit-title'}>Em có muốn thoát không?</h2>
          <p id={'session-exit-message'}>{message}</p>
        </div>

        <div className={'session-exit-actions'}>
          <button type={'button'} className={'button button-secondary'} onClick={onCancel}>
            Ở lại làm tiếp
          </button>
          <button type={'button'} className={'button session-exit-confirm'} onClick={onConfirm}>
            Thoát và lưu bài
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
