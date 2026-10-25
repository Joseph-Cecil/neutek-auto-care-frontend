import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  CreateFeedbackRequest,
  FeedbackListResponse,
  JobFeedback,
  UpdateFeedbackRequest,
} from '@/lib/dto';

export const feedbackDal = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<FeedbackListResponse>(ENDPOINTS.FEEDBACK.LIST, { params }),
  getByJob: (jobId: string) =>
    apiClient.get<ApiResponse<JobFeedback>>(ENDPOINTS.FEEDBACK.BY_JOB(jobId)),
  create: (body: CreateFeedbackRequest) =>
    apiClient.post<ApiResponse<JobFeedback>>(ENDPOINTS.FEEDBACK.CREATE, body),
  update: (id: string, body: UpdateFeedbackRequest) =>
    apiClient.patch<ApiResponse<JobFeedback>>(ENDPOINTS.FEEDBACK.BY_ID(id), body),
};
