import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const variants = {
  default:
    'border-[var(--color-nt-border-default)] bg-[var(--color-nt-bg-primary)] text-[var(--color-nt-text-primary)] hover:bg-[var(--color-nt-bg-hover)]',
  primary:
    'border-[var(--color-nt-surface-brand)] bg-[var(--color-nt-surface-brand)] text-[var(--color-nt-text-on-brand)] hover:bg-[var(--color-nt-surface-brand-hover)]',
  danger:
    'border-[var(--color-nt-surface-danger)] bg-[var(--color-nt-surface-danger)] text-[var(--color-nt-text-on-danger)]',
  ghost:
    'border-transparent bg-transparent text-[var(--color-nt-text-primary)] hover:bg-[var(--color-nt-bg-hover)]',
} as const;

const sizes = {
  default: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-[13px]',
  icon: 'h-10 w-10 px-0',
} as const;

export interface NtButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const NtButton = React.forwardRef<HTMLButtonElement, NtButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[8px] border font-semibold whitespace-nowrap',
          'cursor-pointer focus-visible:shadow-[0_0_0_3px_var(--color-nt-bg-brand-subtle)] focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          sizes[size],
          loading && 'nt-loading',
          className,
        )}
        data-variant={variant}
        disabled={loading || disabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {children}
      </button>
    );
  },
);
NtButton.displayName = 'NtButton';
