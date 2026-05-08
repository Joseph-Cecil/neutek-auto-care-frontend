import type { JobStatus } from '@/lib/dto';

export interface JobStatusMeta {
  label:       string;
  badgeClass:  string;
  description: string;
  step:        number;
}

export const JOB_STATUS_META: Record<JobStatus, JobStatusMeta> = {
  intake:           { label: 'Intake',            badgeClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30',       description: 'Vehicle received',              step: 1 },
  diagnosing:       { label: 'Diagnosing',         badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',   description: 'Technician diagnosing',         step: 2 },
  quote_sent:       { label: 'Quote Sent',         badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',      description: 'Awaiting customer review',      step: 3 },
  quote_approved:   { label: 'Quote Approved',     badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', description: 'Quote approved',            step: 4 },
  quote_rejected:   { label: 'Quote Rejected',     badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',         description: 'Quote rejected',               step: 0 },
  in_progress:      { label: 'In Progress',        badgeClass: 'bg-violet-500/20 text-violet-400 border-violet-500/30', description: 'Repair underway',             step: 5 },
  quality_check:    { label: 'Quality Check',      badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30', description: 'Quality inspection',          step: 6 },
  ready_for_pickup: { label: 'Ready for Pickup',   badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',      description: 'Awaiting collection',          step: 7 },
  completed:        { label: 'Completed',          badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',   description: 'Job completed',                step: 8 },
  cancelled:        { label: 'Cancelled',          badgeClass: 'bg-red-700/20 text-red-400 border-red-700/30',         description: 'Job cancelled',                step: 0 },
};

export const JOB_STATUS_STEPS: JobStatus[] = [
  'intake', 'diagnosing', 'quote_sent', 'quote_approved',
  'in_progress', 'quality_check', 'ready_for_pickup', 'completed',
];

export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  intake:           ['diagnosing', 'cancelled'],
  diagnosing:       ['quote_sent', 'in_progress', 'cancelled'],
  quote_sent:       ['quote_approved', 'quote_rejected'],
  quote_approved:   ['in_progress', 'cancelled'],
  quote_rejected:   ['diagnosing', 'cancelled'],
  in_progress:      ['quality_check', 'cancelled'],
  quality_check:    ['ready_for_pickup', 'in_progress'],
  ready_for_pickup: ['completed'],
  completed:        [],
  cancelled:        [],
};

export function getStatusMeta(status: JobStatus): JobStatusMeta {
  return JOB_STATUS_META[status];
}

export function canTransitionTo(current: JobStatus, target: JobStatus): boolean {
  return VALID_TRANSITIONS[current].includes(target);
}