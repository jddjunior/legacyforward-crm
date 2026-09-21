const ERRORS: Record<string, string> = {
  auth: 'We could not complete your sign-in. Please try again.',
  config: 'WorkOS is not configured yet. Add WORKOS_API_KEY and WORKOS_CLIENT_ID.',
};

export default function SignInCard({ next, error }: { next: string; error?: string }) {
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="card w-full max-w-md p-8">
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <span className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm">
          BA
        </span>
        <div className="text-lg font-semibold tracking-tight">Branch Avenue</div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight mb-2">Sign in</h1>
      <p className="text-ink-muted text-sm mb-7">
        Use your work email to continue to Branch Avenue.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERRORS[error] || ERRORS.auth}
        </div>
      )}

      <form method="GET" action="/api/auth/login" target="_top" className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            className="input mt-1 w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full justify-center">
          Continue with WorkOS
        </button>
      </form>

      <p className="mt-4 text-xs text-ink-muted leading-relaxed">
        You&apos;ll be redirected to WorkOS AuthKit to verify your identity. No password is
        stored by Branch Avenue.
      </p>

      {isDev && (
        <div className="mt-8 pt-6 border-t border-ink-line">
          <div className="label mb-3">Development shortcuts</div>
          <div className="grid gap-2">
            <a
              href="/api/auth/dev-login?email=owner@apex-roofing.com&next=/portal"
              target="_top"
              className="btn justify-center"
            >
              Demo client portal
            </a>
            <a
              href="/api/auth/dev-login?email=priya@lanternfield.com&next=/agency"
              target="_top"
              className="btn justify-center"
            >
              Demo agency console
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
