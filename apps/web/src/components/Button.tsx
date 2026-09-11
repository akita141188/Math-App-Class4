import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: 'primary' | 'secondary' | 'quiet';
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={['button', 'button-' + variant, className].filter(Boolean).join(' ')}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
