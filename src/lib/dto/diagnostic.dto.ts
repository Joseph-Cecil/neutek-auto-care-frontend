export interface DiagnosticReport {
  id: string;
  job_id: string;
  technician_id: string;
  summary: string;
  findings: string | null;
  recommendations: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticPhoto {
  id: string;
  report_id: string;
  url: string;
  key: string;
  caption: string | null;
  created_at: string;
}

export interface CreateDiagnosticRequest {
  jobId: string;
  summary: string;
  findings?: string;
  recommendations?: string;
}

export interface AddDiagnosticPhotoRequest {
  url: string;
  key: string;
  caption?: string;
}