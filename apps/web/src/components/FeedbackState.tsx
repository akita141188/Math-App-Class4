import { CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react';

interface FeedbackStateProps {
  kind: 'success' | 'hint' | 'retry';
  children: string;
}

const icons = {
  success: CheckCircle2,
  hint: Lightbulb,
  retry: RotateCcw,
};

export function FeedbackState({ kind, children }: FeedbackStateProps) {
  const Icon = icons[kind];
  return (
    <div className={'feedback feedback-' + kind} role={kind === 'retry' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" size={22} />
      <p>{children}</p>
    </div>
  );
}
