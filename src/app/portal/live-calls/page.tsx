import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Phone, PhoneMissed, Clock, UserPlus } from 'lucide-react';
import { logCall, convertCallToLead, deleteCall } from '@/app/actions/calls';
import { PageHeader, NewItemPanel, Field, Empty, StatCard, StatusBadge, ActionButton } from '@/components/ui';
import { dateTime, duration, label } from '@/lib/format';

export default async function LiveCallsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const calls = await prisma.call.findMany({ where: { orgId: session.orgId }, orderBy: { createdAt: 'desc' }, take: 200 });
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const today = calls.filter((c) => c.createdAt.getTime() > dayAgo);
  const answered = calls.filter((c) => c.status === 'answered');
  const avg = answered.length ? Math.round(answered.reduce((s, c) => s + c.durationSec, 0) / answered.length) : 0;
  const converted = calls.filter((c) => c.leadId).length;

  return (
    <div className="p-8">
      <PageHeader title="Live Calls" subtitle="Inbound calls from your tracking numbers — turn callers into leads in one click." />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Calls (24h)" value={String(today.length)} icon={Phone} />
        <StatCard label="Missed (24h)" value={String(today.filter((c) => c.status === 'missed').length)} icon={PhoneMissed} />
        <StatCard label="Avg. talk time" value={duration(avg)} icon={Clock} />
        <StatCard label="Converted to leads" value={String(converted)} icon={UserPlus} hint={`of ${calls.length} calls`} />
      </div>

      <NewItemPanel label="Log a Call">
        <form action={logCall} className="grid grid-cols-6 gap-3">
          <Field label="Caller number *" className="col-span-2"><input name="callerNumber" required className="input" placeholder="(555) 123-4567" /></Field>
          <Field label="Caller name" className="col-span-2"><input name="callerName" className="input" /></Field>
          <Field label="Outcome">
            <select name="status" className="input">
              <option value="answered">Answered</option>
              <option value="missed">Missed</option>
              <option value="voicemail">Voicemail</option>
            </select>
          </Field>
          <Field label="Minutes"><input name="minutes" type="number" min="0" className="input" placeholder="0" /></Field>
          <Field label="Source" className="col-span-2">
            <select name="source" className="input">
              <option value="">—</option>
              <option value="google_ads">Google Ads</option>
              <option value="meta">Meta</option>
              <option value="organic">Organic</option>
              <option value="direct">Direct</option>
            </select>
          </Field>
          <Field label="Notes" className="col-span-3"><input name="notes" className="input" /></Field>
          <div className="flex items-end justify-end"><button type="submit" className="btn btn-primary">Log Call</button></div>
        </form>
      </NewItemPanel>

      {calls.length === 0 ? (
        <Empty>No calls yet. Calls from your tracking numbers show up here.</Empty>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="px-5 py-3 label">Caller</th>
                <th className="px-5 py-3 label">Outcome</th>
                <th className="px-5 py-3 label">Duration</th>
                <th className="px-5 py-3 label">Source</th>
                <th className="px-5 py-3 label">Notes</th>
                <th className="px-5 py-3 label">When</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {calls.map((c) => (
                <tr key={c.id} className="hover:bg-ink-surface">
                  <td className="px-5 py-3">
                    <div className="font-medium">{c.callerName || 'Unknown caller'}</div>
                    <div className="text-xs text-ink-muted">{c.callerNumber}</div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-ink-muted">{duration(c.durationSec)}</td>
                  <td className="px-5 py-3 text-ink-muted capitalize">{c.source ? label(c.source) : '—'}</td>
                  <td className="px-5 py-3 text-ink-muted max-w-xs truncate">{c.notes || '—'}</td>
                  <td className="px-5 py-3 text-ink-muted whitespace-nowrap">{dateTime(c.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {c.leadId ? (
                        <a href={`/portal/leads/${c.leadId}`} className="text-xs text-brand">View lead →</a>
                      ) : (
                        <ActionButton action={convertCallToLead.bind(null, c.id)} tone="link">Create lead</ActionButton>
                      )}
                      <ActionButton action={deleteCall.bind(null, c.id)} tone="danger">Delete</ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
