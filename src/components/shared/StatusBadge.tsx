import { cn } from '@/lib/utils/cn';
import { getStatusMeta } from '@/lib/utils/jobStatus';
import type { JobStatus } from '@/lib/dto';

export function JobStatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  const meta = getStatusMeta(status);
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      meta.badgeClass,
      className,
    )}>
      {meta.label}
    </span>
  );
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger:  'bg-red-500/10 text-red-400 border-red-500/20',
  info:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  muted:   'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({
  label,
  variant = 'default',
  className,
}: {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      variantMap[variant],
      className,
    )}>
      {label}
    </span>
  );
}