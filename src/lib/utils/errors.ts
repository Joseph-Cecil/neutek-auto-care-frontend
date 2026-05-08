import { isAxiosError } from 'axios';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import type { ApiError } from '@/lib/dto';

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (error.message)  return error.message;
  }
  if (error instanceof Error)    return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

export function getStatusCode(error: unknown): number | null {
  return isAxiosError(error) ? (error.response?.status ?? null) : null;
}

export function isStatus(error: unknown, status: number): boolean {
  return getStatusCode(error) === status;
}

export function getValidationErrors(
  error: unknown,
): Array<{ field: string; message: string }> | null {
  return isAxiosError<ApiError>(error)
    ? (error.response?.data?.errors ?? null)
    : null;
}

export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fallbackField: Path<T> = 'root' as Path<T>,
): void {
  const errs = getValidationErrors(error);
  if (errs && errs.length > 0) {
    errs.forEach(({ field, message }) => {
      setError(field as Path<T>, { type: 'server', message });
    });
  } else {
    setError(fallbackField, { type: 'server', message: getErrorMessage(error) });
  }
}

export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) ? (!error.response && !!error.request) : false;
}