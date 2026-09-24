import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateOrgProfile, updateProfile, inviteMember, removeMember } from '@/app/actions/settings';
import { PageHeader, Field, ActionButton } from '@/components/ui';
import { label, shortDate } from '@/lib/format';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const [org, user, memberships] = await Promise.all([
    prisma.org.findUnique({ where: { id: session.orgId } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.membership.findMany({ where: { orgId: session.orgId }, include: { user: true }, orderBy: { createdAt: 'asc' } }),
  ]);
  if (!org) return null;
  const canManage = ['owner', 'manager', 'agency_admin'].includes(session.orgRole || '');

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader title="Settings" subtitle={`Onboarding: ${label(org.onboardingStage)} · Created ${shortDate(org.createdAt)}`} />

      <form action={updateOrgProfile} className="card p-6 mb-4">
        <h2 className="text-sm font-semibold mb-4">Organization</h2>
        <fieldset disabled={!canManage} className="grid grid-cols-2 gap-4">
          <Field label="Business name *"><input name="name" required defaultValue={org.name} className="input" /></Field>
          <Field label="Website"><input name="website" type="url" defaultValue={org.website || ''} className="input" placeholder="https://" /></Field>
          <Field label="Primary contact"><input name="contactName" defaultValue={org.contactName || ''} className="input" /></Field>
          <Field label="Contact phone"><input name="contactPhone" defaultValue={org.contactPhone || ''} className="input" /></Field>
          <Field label="Logo URL"><input name="logoUrl" type="url" defaultValue={org.logoUrl || ''} className="input" /></Field>
          <Field label="Brand color">
            <input name="brandColor" type="color" defaultValue={org.brandColor || '#335aea'} className="input p-1 h-10 w-20" />
          </Field>
          <div className="text-xs text-ink-muted col-span-2">
            Billing: {org.stripeCustomerId ? `Stripe customer ${org.stripeCustomerId}` : 'no card on file yet'}
          </div>
        </fieldset>
        {canManage && <div className="flex justify-end mt-4"><button type="submit" className="btn btn-primary">Save organization</button></div>}
      </form>

      <form action={updateProfile} className="card p-6 mb-4">
        <h2 className="text-sm font-semibold mb-4">Your Account</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name"><input name="name" defaultValue={user?.name || ''} className="input" /></Field>
          <Field label="Email"><input value={user?.email || ''} disabled className="input bg-ink-surface" /></Field>
        </div>
        <div className="flex justify-end mt-4"><button type="submit" className="btn">Save profile</button></div>
      </form>

      <div className="card p-6">
        <h2 className="text-sm font-semibold mb-4">Team Members</h2>
        <div className="divide-y divide-ink-line mb-4">
          {memberships.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <span className="w-8 h-8 rounded-full bg-ink-surface flex items-center justify-center text-xs font-bold">
                {(m.user.name || m.user.email).split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">{m.user.name || m.user.email}{m.userId === session.userId && <span className="text-ink-muted font-normal"> (you)</span>}</div>
                <div className="text-xs text-ink-muted">{m.user.email}</div>
              </div>
              <span className={`badge ${m.role === 'owner' ? 'badge-blue' : m.role === 'agency_admin' ? 'badge-green' : 'badge-gray'}`}>{label(m.role)}</span>
              {canManage && m.userId !== session.userId && m.role !== 'agency_admin' && (
                <ActionButton action={removeMember.bind(null, m.id)} tone="danger">Remove</ActionButton>
              )}
            </div>
          ))}
        </div>
        {canManage && (
          <form action={inviteMember} className="grid grid-cols-7 gap-3 pt-4 border-t border-ink-line">
            <Field label="Invite by email *" className="col-span-3"><input name="email" type="email" required className="input" placeholder="teammate@company.com" /></Field>
            <Field label="Name" className="col-span-2"><input name="name" className="input" /></Field>
            <Field label="Role">
              <select name="role" className="input" defaultValue="viewer">
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </Field>
            <div className="flex items-end"><button type="submit" className="btn btn-primary w-full justify-center">Add</button></div>
            <p className="col-span-7 text-xs text-ink-muted">They sign in with this email and land in this workspace.</p>
          </form>
        )}
      </div>
    </div>
  );
}
