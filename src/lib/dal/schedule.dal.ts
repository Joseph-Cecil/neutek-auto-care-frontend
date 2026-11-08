import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, ScheduleAssignment, ScheduleBay, ScheduleBoard } from '@/lib/dto';

export const scheduleDal = {
  board: () => apiClient.get<ApiResponse<ScheduleBoard>>(ENDPOINTS.SCHEDULE.BOARD),
  assign: (body: { jobId: string; technicianId: string }) =>
    apiClient.post<ApiResponse<ScheduleAssignment>>(ENDPOINTS.SCHEDULE.ASSIGN, body),
  setBay: (id: string, jobId: string | null) =>
    apiClient.patch<ApiResponse<ScheduleBay>>(ENDPOINTS.SCHEDULE.BAY(id), { jobId }),
};
