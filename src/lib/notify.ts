import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/utils/errors';

const TOAST_MS = 2600;

/**
 * The one toast helper for new screens. Existing `toast` calls stay until that screen is redesigned.
 * Success text is shown as given. An error can be a string or a thrown API error.
 */
export function notify(kind: 'success' | 'error', message: unknown): void {
  const text = kind === 'error' ? getErrorMessage(message) : String(message ?? '');
  if (kind === 'success') {
    toast.success(text, { duration: TOAST_MS });
    return;
  }
  toast.error(text, { duration: TOAST_MS });
}
