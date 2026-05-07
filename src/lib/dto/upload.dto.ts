// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Upload DTOs
// NOTE: Several Swagger discrepancies corrected here
// ─────────────────────────────────────────────────────────────
import type { UploadFolder } from './enums.dto';

export interface PresignResponse {
  uploadUrl: string;    // PUT directly to this — no Authorization header
  publicUrl: string;    // reference the file at this URL
  key: string;          // S3/R2 object key — needed for confirm step
  expiresIn: number;    // seconds (300)
}

export interface PresignRequest {
  filename: string;         // lowercase 'filename' — Swagger says 'fileName' (WRONG)
  contentType: string;      // must be allowed MIME type
  folder?: UploadFolder;    // default 'general'
  fileSizeBytes?: number;   // max 10485760
}

export interface ConfirmUploadRequest {
  key: string;              // the key from presign — Swagger says 'fileUrl' (WRONG)
  resourceType?: string;
  resourceId?: string;
}

export type AllowedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'application/pdf';