// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — API Envelope Types
// ─────────────────────────────────────────────────────────────

/** Standard success envelope */
export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  requestId: string;
}

/** Paginated success envelope */
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

/** Error envelope (all non-2xx responses) */
export interface ApiError {
  success: false;
  message: string;
  requestId: string;
  /** Only present on 400 validation errors */
  errors?: Array<{ field: string; message: string }>;
}

/** Pagination query params shared across list endpoints */
export interface PaginationParams {
  page?: number;
  limit?: number;
}