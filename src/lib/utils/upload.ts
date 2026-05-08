import type { UploadFolder, AllowedMimeType } from '@/lib/dto';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

const ALLOWED: AllowedMimeType[] = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf',
];
const MAX_BYTES = 10 * 1024 * 1024;

export class UploadError extends Error {
  constructor(message: string) { super(message); this.name = 'UploadError'; }
}

export function validateFile(file: File): void {
  if (!ALLOWED.includes(file.type as AllowedMimeType)) {
    throw new UploadError(`File type '${file.type}' is not allowed.`);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`File ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the 10MB limit.`);
  }
}

export async function uploadFile(file: File, folder: UploadFolder = 'general'): Promise<string> {
  validateFile(file);

  const presignRes = await apiClient.post<{
    success: boolean;
    data: { uploadUrl: string; publicUrl: string; key: string; expiresIn: number };
  }>(ENDPOINTS.UPLOADS.PRESIGN, {
    filename:      file.name.toLowerCase(),
    contentType:   file.type,
    folder,
    fileSizeBytes: file.size,
  });

  const { uploadUrl, publicUrl, key } = presignRes.data.data;

  const uploadRes = await fetch(uploadUrl, {
    method:  'PUT',
    body:    file,
    headers: { 'Content-Type': file.type },
  });

  if (!uploadRes.ok) {
    throw new UploadError(`Upload failed (HTTP ${uploadRes.status})`);
  }

  await apiClient.post(ENDPOINTS.UPLOADS.CONFIRM, { key });
  return publicUrl;
}

export async function compressAndUpload(
  file: File,
  folder: UploadFolder = 'general',
): Promise<string> {
  if (!file.type.startsWith('image/')) return uploadFile(file, folder);

  const imageCompression = (await import('browser-image-compression')).default;
  const compressed = await imageCompression(file, {
    maxSizeMB:        1,
    maxWidthOrHeight: 1920,
    fileType:         'image/webp',
    useWebWorker:     true,
  });
  return uploadFile(compressed, folder);
}