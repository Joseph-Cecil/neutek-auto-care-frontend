'use client';

import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-lg border border-dashed',
      'border-border bg-muted/20 p-12 text-center',
      className,
    )}>
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <span className="text-muted-foreground">{icon}</span>
        </div>
      )}
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">{action.label}</Button>
      )}
    </div>
  );
}