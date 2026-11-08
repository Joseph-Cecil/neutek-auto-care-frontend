import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const tones = {
  default:
    'border-[var(--color-nt-border-default)] bg-[var(--color-nt-bg-secondary)] text-[var(--color-nt-text-secondary)]',
  ok: 'border-[#ABEFC6] bg-[var(--color-nt-bg-success)] text-[var(--color-nt-text-success)]',
  warn: 'border-[#FDE68A] bg-[var(--color-nt-bg-warning)] text-[var(--color-nt-text-warning)]',
  bad: 'border-[#FECDCA] bg-[var(--color-nt-bg-danger)] text-[var(--color-nt-text-danger)]',
  brand:
    'border-[var(--color-nt-bg-brand-subtle)] bg-[var(--color-nt-bg-brand)] text-[var(--color-nt-text-primary)]',
} as const;

export function Pill({
  tone = 'default',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
