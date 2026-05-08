import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, Job, JobStatusHistory,
  CreateJobRequest, UpdateJobRequest, TransitionJobRequest, ListJobsParams,
} from '@/lib/dto';

export const jobDal = {
  list:        (params?: ListJobsParams) =>
    apiClient.get<PaginatedResponse<Job>>(ENDPOINTS.JOBS.LIST, { params }),
  create:      (body: CreateJobRequest) =>
    apiClient.post<ApiResponse<Job>>(ENDPOINTS.JOBS.CREATE, body),
  getByNumber: (jobNumber: string) =>
    apiClient.get<ApiResponse<Job>>(ENDPOINTS.JOBS.BY_NUMBER(jobNumber)),
  getById:     (id: string) =>
    apiClient.get<ApiResponse<Job>>(ENDPOINTS.JOBS.BY_ID(id)),
  getHistory:  (id: string) =>
    apiClient.get<ApiResponse<JobStatusHistory[]>>(ENDPOINTS.JOBS.HISTORY(id)),
  update:      (id: string, body: UpdateJobRequest) =>
    apiClient.patch<ApiResponse<Job>>(ENDPOINTS.JOBS.BY_ID(id), body),
  transition:  (id: string, body: TransitionJobRequest) =>
    apiClient.post<ApiResponse<Job>>(ENDPOINTS.JOBS.TRANSITION(id), body),
};