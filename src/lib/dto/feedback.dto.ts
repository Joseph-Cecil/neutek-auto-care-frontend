import type { PaginatedResponse } from './api.dto';

export interface JobFeedback {
  id: string;
  job_id: string;
  job_number: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  stars: number;
  comment: string | null;
  featured: boolean;
  reply: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackSummary {
  count: number;
  average: number;
  featured: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface FeedbackListResponse extends PaginatedResponse<JobFeedback> {
  summary: FeedbackSummary;
}

export interface CreateFeedbackRequest {
  jobId: string;
  stars: number;
  comment?: string;
}

export interface UpdateFeedbackRequest {
  featured?: boolean;
  reply?: string;
}
