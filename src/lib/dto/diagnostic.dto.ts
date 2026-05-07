// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Diagnostic DTOs
// NOTE: Swagger says required field is 'findings' — WRONG
//       Correct required field is 'summary'
// ─────────────────────────────────────────────────────────────

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
  summary: string;              // required, max 2000 chars
  findings?: string;
  recommendations?: string;
}

/** NOTE: one photo per call — Swagger says array (wrong) */
export interface AddDiagnosticPhotoRequest {
  url: string;        // publicUrl from presign
  key: string;        // key from presign
  caption?: string;
}