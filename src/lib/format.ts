/** Cents → "$1,234" (no decimals unless needed). */
export function money(cents: number | null | undefined) {
  if (cents == null) return '—';
  const dollars = cents / 100;
  return `$${dollars.toLocaleString(undefined, { maximumFractionDigits: dollars % 1 ? 2 : 0 })}`;
}

export function shortDate(d: Date | null | undefined) {
  return d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

export function dateTime(d: Date) {
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function duration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function label(value: string) {
  return value.replace(/_/g, ' ');
}
