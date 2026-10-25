import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const tones = {
  warn: 'border-[#FDE68A] bg-[var(--color-nt-bg-warning)] text-[var(--color-nt-text-warning)]',
  info: 'border-[var(--color-nt-border-default)] bg-[var(--color-nt-bg-secondary)] text-[var(--color-nt-text-secondary)]',
  ok: 'border-[#ABEFC6] bg-[var(--color-nt-bg-success)] text-[var(--color-nt-text-success)]',
} as const;

export function Banner({
  tone = 'warn',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: keyof typeof tones }) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-[8px] border px-4 py-3 text-[13px] font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
