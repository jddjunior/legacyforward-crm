import { saveBrand } from '@/app/actions/onboarding';

export default function BrandStep({ org }: { org: { name: string; brandColor: string | null; logoUrl: string | null } }) {
  const color = org.brandColor || '#335aea';
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold mb-1">Brand Setup</h2>
      <p className="text-xs text-ink-muted mb-5">Upload your logo and set your brand color.</p>
      <form action={saveBrand} className="space-y-4">
        <div>
          <label className="label block mb-1.5">Organization Name</label>
          <input name="name" defaultValue={org.name} className="input" />
        </div>
        <div>
          <label className="label block mb-1.5">Logo URL</label>
          <input name="logoUrl" defaultValue={org.logoUrl ?? ''} className="input" placeholder="https://…" />
        </div>
        <div>
          <label className="label block mb-1.5">Brand Color</label>
          <div className="flex items-center gap-3">
            <input name="brandColor" type="color" defaultValue={color} className="w-12 h-10 rounded-lg border border-ink-line" />
            <input name="brandColorText" className="input flex-1" defaultValue={color} placeholder="#335aea" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full justify-center">Continue →</button>
      </form>
    </div>
  );
}
