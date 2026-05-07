import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse,
  Booking, CreateBookingRequest, UpdateBookingRequest, ListBookingsParams,
} from '@/lib/dto';

export const bookingDal = {
  list: (params?: ListBookingsParams) =>
    apiClient.get<PaginatedResponse<Booking>>(ENDPOINTS.BOOKINGS.LIST, { params }),

  create: (body: CreateBookingRequest) =>
    apiClient.post<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.CREATE, body),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.BY_ID(id)),

  update: (id: string, body: UpdateBookingRequest) =>
    apiClient.patch<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.BY_ID(id), body),

  cancel: (id: string) =>
    apiClient.post<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.CANCEL(id)),
};