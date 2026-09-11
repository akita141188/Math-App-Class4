import type { PropsWithChildren, ReactNode } from 'react';

interface LearningCardProps extends PropsWithChildren {
  eyebrow?: string;
  title?: string;
  aside?: ReactNode;
  className?: string;
}

export function LearningCard({
  eyebrow,
  title,
  aside,
  children,
  className = '',
}: LearningCardProps) {
  return (
    <section className={['learning-card', className].filter(Boolean).join(' ')}>
      {(eyebrow || title || aside) && (
        <div className="learning-card-heading">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
