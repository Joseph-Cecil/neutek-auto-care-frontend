import type { JobStatus } from './enums.dto';

export interface TrackingHistoryEntry {
  fromStatus: JobStatus | null;
  toStatus: JobStatus;
  notes: string | null;
  createdAt: string;
}

export interface TrackingUpdate {
  jobId: string;
  jobNumber: string;
  status: JobStatus;
  title: string;
  updatedAt: string;
  history: TrackingHistoryEntry[];
  estimatedCompletionAt: string | null;
}