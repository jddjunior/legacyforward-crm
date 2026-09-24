import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Shared building blocks for portal/agency pages. */

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-display">{title}</h1>
        {subtitle && <p className="text-ink-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** Collapsible "+ New …" card wrapping a create form. */
export function NewItemPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="card mb-6">
      <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold select-none">+ {label}</summary>
      <div className="p-5 pt-2">{children}</div>
    </details>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card p-12 text-center text-ink-muted text-sm">{children}</div>;
}

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon?: LucideIcon; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={16} className="text-brand" />}
        <span className="label">{label}</span>
      </div>
      <div className="stat">{value}</div>
      {hint && <div className="text-xs text-ink-muted mt-1">{hint}</div>}
    </div>
  );
}

const TONES: Record<string, string> = {
  active: 'badge-green', connected: 'badge-green', approved: 'badge-green', published: 'badge-green',
  done: 'badge-green', answered: 'badge-green', paid: 'badge-green', qualified: 'badge-green',
  scheduled: 'badge-blue', in_progress: 'badge-blue', contacted: 'badge-blue',
  pending: 'badge-yellow', draft: 'badge-gray', paused: 'badge-yellow', open: 'badge-yellow', voicemail: 'badge-yellow',
  high: 'badge-red', missed: 'badge-red', rejected: 'badge-red', error: 'badge-red', lost: 'badge-red', failed: 'badge-red',
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${TONES[status] || 'badge-gray'} capitalize`}>{status.replace(/_/g, ' ')}</span>;
}

/** A one-button form that invokes a bound server action. */
export function ActionButton({
  action, children, tone = 'default',
}: { action: () => Promise<void>; children: ReactNode; tone?: 'default' | 'primary' | 'danger' | 'link' }) {
  const cls = {
    default: 'btn text-xs h-8 px-3',
    primary: 'btn btn-primary text-xs h-8 px-3',
    danger: 'text-xs text-red-500 hover:text-red-700',
    link: 'text-xs text-brand hover:underline',
  }[tone];
  return (
    <form action={action}>
      <button type="submit" className={cls}>{children}</button>
    </form>
  );
}
