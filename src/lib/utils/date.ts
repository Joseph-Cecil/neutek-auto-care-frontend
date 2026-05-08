import {
  format, formatDistanceToNow, isAfter, isBefore, parseISO,
  differenceInDays, differenceInHours, differenceInMinutes,
  startOfDay, endOfDay, addDays,
} from 'date-fns';

export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  try   { return parseISO(dateStr); }
  catch { return null; }
}

export function formatDate(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr);
  return d ? format(d, 'MMM d, yyyy') : '—';
}

export function formatDateTime(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr);
  return d ? format(d, "MMM d, yyyy 'at' h:mm a") : '—';
}

export function formatTime(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr);
  return d ? format(d, 'h:mm a') : '—';
}

export function toApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function timeAgo(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—';
}

export function isFuture(dateStr: string): boolean {
  const d = parseDate(dateStr);
  return d ? isAfter(d, new Date()) : false;
}

export function isPast(dateStr: string): boolean {
  const d = parseDate(dateStr);
  return d ? isBefore(d, new Date()) : false;
}

export function daysUntil(dateStr: string): number {
  const d = parseDate(dateStr);
  return d ? differenceInDays(d, new Date()) : 0;
}

export function formatDurationBetween(startStr: string, endStr: string): string {
  const start = parseDate(startStr);
  const end   = parseDate(endStr);
  if (!start || !end) return '—';
  const hours = differenceInHours(end, start);
  if (hours >= 24) return `${differenceInDays(end, start)}d`;
  if (hours >= 1) {
    const mins = differenceInMinutes(end, start) % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${differenceInMinutes(end, start)}m`;
}

export { startOfDay, endOfDay, addDays, format };