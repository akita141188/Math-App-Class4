interface ProgressIndicatorProps {
  current: number;
  total: number;
  label: string;
}

export function ProgressIndicator({ current, total, label }: ProgressIndicatorProps) {
  return (
    <div className="step-progress" aria-label={label}>
      <div className="step-progress-copy">
        <span>{label}</span>
        <strong>
          {current}/{total}
        </strong>
      </div>
      <div
        className="step-progress-track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <span style={{ width: String((current / total) * 100) + '%' }} />
      </div>
    </div>
  );
}
