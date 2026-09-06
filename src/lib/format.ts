const GREEN = new Set(['active', 'approved', 'paid', 'connected', 'live', 'published', 'indexed', 'won', 'qualified', 'resolved']);
const RED = new Set(['rejected', 'failed', 'error', 'lost', 'missed', 'needs_work', 'refunded']);
const YELLOW = new Set(['pending', 'awaiting_approval', 'changes_requested', 'in_review', 'building', 'processing', 'draft', 'sent', 'new', 'contacted', 'locked']);

/** Maps a domain status string onto the design system's badge classes. */
export function badgeClass(status: string) {
  const key = status.toLowerCase();
  if (GREEN.has(key)) return 'badge badge-green';
  if (RED.has(key)) return 'badge badge-red';
  if (YELLOW.has(key)) return 'badge badge-yellow';
  return 'badge badge-gray';
}

export const humanize = (value: string) => value.replace(/_/g, ' ');

export const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const shortDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const dateTime = (date: Date) =>
  date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
