// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Job Status Utilities
// ─────────────────────────────────────────────────────────────
import tblue-500/20 text-blue-400 border-blue-500/30',
    description: 'Waiting for customer to review quote',
    step: 3,
  },
  quote_approved: {
    label:       'Quote Approved',
    color:       'bg-emerald-500',
    textColor:   'text-emerald-100',
    badgeClass:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Customer approved the repair quote',
    step: 4,
  },
  quote_rejected: {
    label:       'Quote Rejected',
    color:       'bg-red-500',
    textColor:   'text-red-100',
    badgeClass:  'bg-red-500/20 text-red-400 border-red-500/30',
    description: 'Customer rejected the quote',
    step: 0,
  },
  in_progress: {
    label:       'In Progress',
    color:       'bg-violet-500',
    textColor:   'text-violet-100',
    badgeClass:  'bg-violet-500/20 text-violet-400 border-violet-500/30',
    description: 'Repair work is underway',
    step: 5,
  },
  quality_check: {
    label:       'Quality Check',
    color:       'bg-orange-500',
    textColor:   'text-orange-100',
    badgeClass:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
    description: 'Technician is performing quality inspection',
    step: 6,
  },
  ready_for_pickup: {
    label:       'Ready for Pickup',
    color:       'bg-cyan-500',
    textColor:   'text-cyan-100',
    badgeClass:  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    description: 'Vehicle is ready — awaiting customer collection',
    step: 7,
  },
  completed: {
    label:       'Completed',
    color:       'bg-green-500',
    textColor:   'text-green-100',
    badgeClass:  'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Job completed successfully',
    step: 8,
  },
  cancelled: {
    label:       'Cancelled',
    color:       'bg-red-700',
    textColor:   'text-red-100',
    badgeClass:  'bg-red-700/20 text-red-400 border-red-700/30',
    description: 'Job was cancelled',
    step: 0,
  },
};

/** Ordered steps for the timeline display */
export const JOB_STATUS_STEPS: JobStatus[] = [
  'intake',
  'diagnosing',
  'quote_sent',
  'quote_approved',
  'in_progress',
  'quality_check',
  'ready_for_pickup',
  'completed',
];

/** Valid next transitions for each status (mirrors backend state machine) */
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

export function canTransitionTo(
  currentStatus: JobStatus,
  targetStatus: JobStatus,
): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(targetStatus);
}