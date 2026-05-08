import type { UploadFolder } from './enums.dto';

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

export interface PresignRequest {
  filename: string;
  contentType: string;
  folder?: UploadFolder;
  fileSizeBytes?: number;
}

export interface ConfirmUploadRequest {
  key: string;
  resourceType?: string;
  resourceId?: string;
}

export type AllowedMimeType =
  | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'application/pdf';