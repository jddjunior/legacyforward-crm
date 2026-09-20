import { saveKickoff } from '@/app/actions/onboarding';

export default function KickoffStep({
  org,
}: {
  org: { name: string; website: string | null; contactName: string | null; contactPhone: string | null; goals: string | null };
}) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold mb-1">Kickoff Details</h2>
      <p className="text-xs text-ink-muted mb-5">
        Your proposal is approved — tell us who we&apos;re working with and what success looks like.
      </p>
      <form action={saveKickoff} className="space-y-4">
        <div>
          <label className="label block mb-1.5">Primary contact</label>
          <input name="contactName" defaultValue={org.contactName ?? ''} required className="input" placeholder="Jordan Reese" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1.5">Phone</label>
            <input name="contactPhone" defaultValue={org.contactPhone ?? ''} className="input" placeholder="(555) 010-2244" />
          </div>
          <div>
            <label className="label block mb-1.5">Current website</label>
            <input name="website" type="url" defaultValue={org.website ?? ''} className="input" placeholder="https://acme.com" />
          </div>
        </div>
        <div>
          <label className="label block mb-1.5">Goals for the first 90 days</label>
          <textarea name="goals" defaultValue={org.goals ?? ''} rows={3} className="input" placeholder="More booked jobs from paid search, cleaner lead follow-up…" />
        </div>
        <button type="submit" className="btn btn-primary w-full justify-center">Continue →</button>
      </form>
    </div>
  );
}
