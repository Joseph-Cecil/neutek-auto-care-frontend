import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  DiagnosticReport, DiagnosticPhoto,
  CreateDiagnosticRequest, AddDiagnosticPhotoRequest,
} from '@/lib/dto';

export const diagnosticDal = {
  getByJobId: (jobId: string) =>
    apiClient.get<ApiResponse<DiagnosticReport>>(ENDPOINTS.DIAGNOSTICS.BY_JOB(jobId)),

  create: (body: CreateDiagnosticRequest) =>
    apiClient.post<ApiResponse<DiagnosticReport>>(ENDPOINTS.DIAGNOSTICS.CREATE, body),

  /** One photo per call — Swagger says array (wrong) */
  addPhoto: (id: string, body: AddDiagnosticPhotoRequest) =>
    apiClient.post<ApiResponse<DiagnosticPhoto>>(ENDPOINTS.DIAGNOSTICS.PHOTOS(id), body),

  deletePhoto: (id: string, photoId: string) =>
    apiClient.delete<void>(ENDPOINTS.DIAGNOSTICS.PHOTO_BY_ID(id, photoId)),
};