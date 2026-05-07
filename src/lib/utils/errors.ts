// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Error Handling Utilities
// ─────────────────────────────────────────────────────────────
import { isAxiosError } from 'axios';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import type { ApiError } from '@/lib/dto';

/**
 * Extract a human-readable message from any thrown error.
 * Handles Axios errors, native Error, and unknown types.
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

/**
 * Get HTTP status code from an Axios error.
 */
export function getStatusCode(error: unknown): number | null {
  if (isAxiosError(error)) return error.response?.status ?? null;
  return null;
}

/**
 * Check if an error is a specific HTTP status
 */
export function isStatus(error: unknown, status: number): boolean {
  return getStatusCode(error) === status;
}

/**
 * Get validation errors array (only present on 400 responses)
 */
export function getValidationErrors(
  error: unknown,
): Array<{ field: string; message: string }> | null {
  if (isAxiosError<ApiError>(error)) {
    return error.response?.data?.errors ?? null;
  }
  return null;
}

/**
 * Apply server-side validation errors to React Hook Form fields.
 * Maps { field, message }[] from the API to form field errors.
 *
 * @example
 * onError: (error) => {
 *   applyServerErrors(error, form.setError);
 * }
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fallbackField: Path<T> = 'root' as Path<T>,
): void {
  const validationErrors = getValidationErrors(error);

  if (validationErrors && validationErrors.length > 0) {
    validationErrors.forEach(({ field, message }) => {
      setError(field as Path<T>, { type: 'server', message });
    });
  } else {
    // Non-validation error: attach to root
    setError(fallbackField, {
      type: 'server',
      message: getErrorMessage(error),
    });
  }
}

/**
 * Check if an error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response && !!error.request;
  }
  return false;
}