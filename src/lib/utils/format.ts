const GHS_FORMATTER = new Intl.NumberFormat('en-GH', {
  style:                 'currency',
  currency:              'GHS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function pesewasToGHS(pesewas: number): string {
  return GHS_FORMATTER.format(pesewas / 100);
}

export function pesewasToFloat(pesewas: number): number {
  return pesewas / 100;
}

export function ghsToPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233')) return `+${digits}`;
  if (digits.startsWith('0'))   return `+233${digits.slice(1)}`;
  return phone;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function fullName(
  firstName: string | null | undefined,
  lastName:  string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}