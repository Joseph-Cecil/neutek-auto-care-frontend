import { cn } from '@/lib/utils/cn';
import { JOB_STATUS_STEPS, getStatusMeta } from '@/lib/utils/jobStatus';
import { formatDateTime } from '@/lib/utils/date';
import type { TrackingUpdate, JobStatus } from '@/lib/dto';

export function StatusTimeline({ tracking }: { tracking: TrackingUpdate }) {
  const currentStep = getStatusMeta(tracking.status).step;

  return (
    <div className="space-y-4">
      {/* Progress steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {JOB_STATUS_STEPS.map((status, i) => {
            const meta     = getStatusMeta(status);
            const done     = currentStep > meta.step;
            const active   = tracking.status === status;
            const upcoming = currentStep < meta.step;

            return (
              <div key={status} className="flex flex-1 flex-col items-center">
                {/* Connector */}
                {i > 0 && (
                  <div className={cn(
                    'absolute top-4 h-0.5 transition-all',
                    done ? 'bg-primary' : 'bg-white/10',
                  )} style={{ left: (i / (JOB_STATUS_STEPS.length - 1) * 100) + '%', width: (100 / (JOB_STATUS_STEPS.length - 1)) + '%' }} />
                )}

                {/* Dot */}
                <div className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                  done   ? 'border-primary bg-primary text-white' :
                  active ? 'border-primary bg-primary/20 text-primary animate-pulse' :
                           'border-white/20 bg-transparent text-white/20',
                )}>
                  {done ? '✓' : i + 1}
                </div>

                {/* Label */}
                <p className={cn(
                  'mt-2 hidden text-center text-[10px] leading-tight sm:block',
                  active ? 'font-semibold text-primary' : done ? 'text-white/60' : 'text-white/20',
                )}>
                  {meta.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* History log */}
      {tracking.history.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Status History</p>
          {[...tracking.history].reverse().map((entry, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/3 p-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                    getStatusMeta(entry.toStatus).badgeClass,
                  )}>
                    {getStatusMeta(entry.toStatus).label}
                  </span>
                  <span className="text-xs text-white/30">{formatDateTime(entry.createdAt)}</span>
                </div>
                {entry.notes && <p className="mt-1 text-xs text-white/50">{entry.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}