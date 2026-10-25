import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export function NtEmpty({
  icon,
  title,
  description,
  className,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-4 py-12 text-center', className)}>
      {icon ? (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-nt-bg-secondary)] text-[var(--color-nt-text-tertiary)]">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-[var(--color-nt-text-primary)]">{title}</p>
      {description ? (
        <p className="max-w-xs text-sm text-[var(--color-nt-text-tertiary)]">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
