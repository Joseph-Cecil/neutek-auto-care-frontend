// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Job DTOs
// ─────────────────────────────────────────────────────────────
import type { JobStatus, JobPriority } from './enums.dto';

export interface Job {
  id: string;
  job_number: string;                       // e.g. 'JOB-20240115-000042'
  booking_id: string | null;
  customer_id: string;
  vehicle_id: string;
  assigned_technician_id: string | null;
  status: JobStatus;
  priority: JobPriority;
  title: string;
  description: string | null;
  intake_notes: string | null;
  completion_notes: string | null;
  estimated_completion_at: string | null;
  actual_completion_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface JobStatusHistory {
  id: string;
  job_id: string;
  from_status: JobStatus | null;
  to_status: JobStatus;
  changed_by_id: string;
  notes: string | null;
  created_at: string;
}

export interface JobService {
  id: string;
  job_id: string;
  service_id: string;
  quantity: number;
  unit_price_pesewas: number;
  notes: string | null;
}

export interface CreateJobRequest {
  bookingId?: string;
  customerId: string;                       // required
  vehicleId: string;                        // required
  assignedTechnicianId?: string;
  priority?: JobPriority;                   // default: 'normal'
  title: string;                            // max 300 chars
  description?: string;
  intakeNotes?: string;
  estimatedCompletionAt?: string;           // ISO 8601
  serviceIds?: string[];
}

export interface UpdateJobRequest {
  assignedTechnicianId?: string | null;     // null clears assignment
  priority?: JobPriority;
  title?: string;
  description?: string;
  completionNotes?: string;
  estimatedCompletionAt?: string | null;    // null clears
}

export interface TransitionJobRequest {
  status: JobStatus;
  notes?: string;
}

export interface ListJobsParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  priority?: JobPriority;
}