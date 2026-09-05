import SignInButton from '@/components/SignInButton';
import PitchCodeForm from '@/components/PitchCodeForm';

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: { auth_error?: string };
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[45fr_55fr]">
      {/* Left column (45%) — sign in / sign up */}
      <div className="flex items-center justify-center bg-white px-8 py-14">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <span className="w-11 h-11 rounded-[11px] bg-[#14141a] text-[#ffc400] flex items-center justify-center font-bold text-sm">LF</span>
            <div>
              <div className="text-lg font-semibold tracking-tight text-[#14141a]">LegacyForward</div>
              <div className="text-xs text-[#6b6b74] mono uppercase tracking-wider">CRM & Agency Platform</div>
            </div>
          </div>

          <h1 className="text-[28px] font-semibold tracking-[-0.03em] leading-[1.15] text-[#14141a] mb-3">Welcome back.</h1>
          <p className="text-[#5f5f66] mb-8 leading-relaxed text-[14px]">
            Sign in to your client portal and agency tools. New here? You can create an account on the next screen.
          </p>

          {searchParams?.auth_error && (
            <div className="mb-4 rounded-[11px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              We couldn&apos;t complete that sign-in. Please try again.
            </div>
          )}

          <SignInButton />
          <p className="mt-3 text-[12px] text-[#8a8a91]">Secured by WorkOS · single sign-on ready</p>
        </div>
      </div>

      {/* Right column (55%) — pitch proposal code */}
      <div className="flex items-center justify-center bg-[#14141a] px-8 py-14">
        <div className="w-full max-w-md">
          <div className="label text-[#8f8f9a]">Pitch gateway</div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-white mt-2 mb-2">Have a pitch proposal code?</h2>
          <p className="text-[14px] text-[#a8a8b3] leading-relaxed mb-7">
            Enter the code from your proposal to open the interactive pitch — review the plan, approve it, and pay your build fee. No account needed.
          </p>

          <PitchCodeForm />

          <div className="mt-8 pt-7 border-t border-[#26262e] grid grid-cols-3 gap-4">
            <div>
              <div className="label text-[#8f8f9a]">Pitch</div>
              <div className="text-[13px] font-medium mt-1 text-white">Proposal → pay → onboard</div>
            </div>
            <div>
              <div className="label text-[#8f8f9a]">CRM</div>
              <div className="text-[13px] font-medium mt-1 text-white">Leads, pipeline, customers</div>
            </div>
            <div>
              <div className="label text-[#8f8f9a]">Approvals</div>
              <div className="text-[13px] font-medium mt-1 text-white">Ads, socials, reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
