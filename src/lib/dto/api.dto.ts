export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  requestId: string;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  requestId: string;
}

export interface ApiError {
  success: false;
  message: string;
  requestId: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}