import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-surface">
      <div className="card max-w-lg w-full mx-4 p-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm">LF</span>
          <div>
            <div className="text-lg font-semibold tracking-tight">LegacyForward</div>
            <div className="text-xs text-ink-muted font-mono uppercase tracking-wider">CRM & Agency Platform</div>
          </div>
        </div>

        <h1 className="text-display mb-3">Client portal & agency operations, unified.</h1>
        <p className="text-ink-muted mb-8 leading-relaxed">
          Multi-tenant CRM, lead tracking, approvals, and a pitch-to-pay gateway — all in one place.
        </p>

        <div className="flex gap-3">
          <Link href="/api/auth/login" className="btn btn-primary flex-1 justify-center">
            Sign in with WorkOS
          </Link>
          <Link href="/pitch/demo" className="btn flex-1 justify-center">
            View demo pitch
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-ink-line">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="label">Pitch</div>
              <div className="text-sm font-medium mt-1">Proposal → pay → onboard</div>
            </div>
            <div>
              <div className="label">CRM</div>
              <div className="text-sm font-medium mt-1">Leads, pipeline, customers</div>
            </div>
            <div>
              <div className="label">Approvals</div>
              <div className="text-sm font-medium mt-1">Ads, socials, reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
