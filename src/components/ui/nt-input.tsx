import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export const NtInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'h-10 w-full rounded-[8px] border border-[var(--color-nt-border-default)] bg-white px-3',
          'text-sm text-[var(--color-nt-text-primary)]',
          'placeholder:text-[var(--color-nt-text-tertiary)]',
          'focus-visible:shadow-[0_0_0_3px_var(--color-nt-bg-brand-subtle)] focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);
NtInput.displayName = 'NtInput';
