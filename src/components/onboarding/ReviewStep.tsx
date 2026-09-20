import { Rocket } from 'lucide-react';
import { completeOnboarding } from '@/app/actions/onboarding';

export default function ReviewStep({
  org,
  connected,
}: {
  org: { name: string; brandColor: string | null; contactName: string | null; website: string | null; goals: string | null };
  connected: string[];
}) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold mb-1">Review &amp; Launch</h2>
      <p className="text-xs text-ink-muted mb-5">Confirm your setup looks good, then launch your account.</p>
      <form action={completeOnboarding} className="space-y-4">
        <div className="p-4 bg-ink-surface rounded-lg space-y-3">
          <div>
            <div className="label mb-1">Organization</div>
            <div className="text-sm font-medium">{org.name}</div>
          </div>
          {org.contactName && (
            <div>
              <div className="label mb-1">Primary contact</div>
              <div className="text-sm">{org.contactName}</div>
            </div>
          )}
          {org.website && (
            <div>
              <div className="label mb-1">Website</div>
              <div className="text-sm">{org.website.replace(/^https?:\/\//, '')}</div>
            </div>
          )}
          {org.goals && (
            <div>
              <div className="label mb-1">Goals</div>
              <div className="text-sm text-ink-muted">{org.goals}</div>
            </div>
          )}
          <div>
            <div className="label mb-1">Integrations</div>
            <div className="text-sm">
              {connected.length > 0 ? connected.map((c) => c.replace(/_/g, ' ')).join(', ') : 'None yet'}
            </div>
          </div>
          <div>
            <div className="label mb-1">Brand Color</div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded" style={{ background: org.brandColor || '#335aea' }} />
              <span className="text-sm font-mono">{org.brandColor || '#335aea'}</span>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full justify-center">
          <Rocket size={16} /> Launch Account
        </button>
      </form>
    </div>
  );
}
