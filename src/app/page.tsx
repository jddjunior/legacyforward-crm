import SignInButton from '@/components/SignInButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6e3dc]">
      <div className="bg-white border border-[#dcd8cf] rounded-[13px] max-w-lg w-full mx-4 p-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-[11px] bg-[#14141a] text-[#ffc400] flex items-center justify-center font-bold text-sm">LF</span>
          <div>
            <div className="text-lg font-semibold tracking-tight text-[#14141a]">LegacyForward</div>
            <div className="text-xs text-[#6b6b74] mono uppercase tracking-wider">CRM & Agency Platform</div>
          </div>
        </div>

        <h1 className="text-[28px] font-semibold tracking-[-0.03em] leading-[1.15] text-[#14141a] mb-3">Client portal & agency operations, unified.</h1>
        <p className="text-[#5f5f66] mb-8 leading-relaxed text-[14px]">
          Multi-tenant CRM, lead tracking, approvals, and a pitch-to-pay gateway — all in one place.
        </p>

        <SignInButton />

        <div className="mt-8 pt-8 border-t border-[#e9e6de]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="label">Pitch</div>
              <div className="text-[13px] font-medium mt-1 text-[#14141a]">Proposal → pay → onboard</div>
            </div>
            <div>
              <div className="label">CRM</div>
              <div className="text-[13px] font-medium mt-1 text-[#14141a]">Leads, pipeline, customers</div>
            </div>
            <div>
              <div className="label">Approvals</div>
              <div className="text-[13px] font-medium mt-1 text-[#14141a]">Ads, socials, reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
