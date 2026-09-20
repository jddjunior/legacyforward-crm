import Link from 'next/link';
import SignInCard from './sign-in-card';

export const metadata = { title: 'Sign in · Branch Avenue' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const next = searchParams.next || '/portal';

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-surface">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-brand text-white">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center font-bold text-sm">
            BA
          </span>
          <div>
            <div className="text-lg font-semibold tracking-tight">Branch Avenue</div>
            <div className="text-xs opacity-70 font-mono uppercase tracking-wider">
              CRM &amp; Agency Platform
            </div>
          </div>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
            One secure login for your portal and your agency console.
          </h2>
          <p className="opacity-80 leading-relaxed">
            Authentication is handled by WorkOS — SSO, magic links, and social providers,
            all configured in your WorkOS dashboard.
          </p>
        </div>

        <div className="text-xs opacity-60 font-mono uppercase tracking-wider">
          Secured by WorkOS
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex items-center justify-center p-6">
        <SignInCard next={next} error={searchParams.error} />
      </div>
    </div>
  );
}
