export interface DiagnosticReport {
  id: string;
  job_id: string;
  technician_id: string | null;
  findings: string;
  recommendations: string | null;
  parts_needed: unknown | null;
  estimated_time_hours: number | null;
  created_at: string;
  updated_at: string;
  photos?: DiagnosticPhoto[];
}

export interface DiagnosticPhoto {
  id: string;
  diagnostic_report_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  uploaded_at: string;
}

export interface CreateDiagnosticRequest {
  jobId: string;
  findings?: string;
  summary?: string;
  recommendations?: string;
}

export interface AddDiagnosticPhotoRequest {
  url: string;
  caption?: string;
  sortOrder?: number;
}
