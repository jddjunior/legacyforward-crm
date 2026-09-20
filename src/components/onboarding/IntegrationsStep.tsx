import { linkConnections } from '@/app/actions/onboarding';

const PROVIDERS = ['google_ads', 'meta', 'callrail', 'google_analytics', 'google_search_console'];

export default function IntegrationsStep({ connected }: { connected: string[] }) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold mb-1">Connect Integrations</h2>
      <p className="text-xs text-ink-muted mb-5">Link your marketing accounts. You can skip and add these later.</p>
      <form action={linkConnections} className="space-y-3">
        {PROVIDERS.map((p) => (
          <label key={p} className="flex items-center gap-3 p-3 border border-ink-line rounded-lg cursor-pointer hover:bg-ink-surface">
            <input type="checkbox" name="providers" value={p} defaultChecked={connected.includes(p)} className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{p.replace(/_/g, ' ')}</span>
          </label>
        ))}
        <button type="submit" className="btn btn-primary w-full justify-center">Continue →</button>
      </form>
    </div>
  );
}
