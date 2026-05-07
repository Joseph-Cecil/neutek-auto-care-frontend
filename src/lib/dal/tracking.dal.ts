import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, TrackingUpdate } from '@/lib/dto';

export const trackingDal = {
  getByJobNumber: (jobNumber: string) =>
    apiClient.get<ApiResponse<TrackingUpdate>>(ENDPOINTS.TRACKING.BY_NUMBER(jobNumber)),
};