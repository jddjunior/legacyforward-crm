'use client';

import { BUILD_FEE } from './gateData';

// Stage 02 — payment: card details go straight to Stripe, order summary
// on the right with the build fee due today.
export default function PaymentStage({
  changeCount,
  paying,
  onPay,
  onBack,
}: {
  changeCount: number;
  paying: boolean;
  onPay: () => void;
  onBack: () => void;
}) {
  const carryNote = changeCount
    ? `${changeCount} change request${changeCount === 1 ? '' : 's'} will be applied to the build after payment.`
    : 'You approved the build with no change requests.';

  const orderRows = [
    { k: 'Website build — one time', v: `$${BUILD_FEE.toLocaleString('en-US')}`, color: '#111116' },
    { k: 'Program fee — starts after launch', v: 'billed separately', color: '#5f5f66' },
    { k: 'Change requests included', v: String(changeCount), color: '#5f5f66' },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-auto px-[30px] py-7">
      <div className="max-w-[860px]">
        <div className="text-[11.5px] font-semibold tracking-[0.14em] uppercase text-[#146c43]">Step 02 · Payment</div>
        <h2 className="mt-[11px] text-[26px] font-normal tracking-[-0.025em]">Set up billing to release the build</h2>
        <p className="mt-2.5 text-sm leading-[1.65] text-[#45454d] max-w-[600px]">
          One setup charge today, then the monthly program fee. Card details go straight to Stripe — the portal never
          stores them. {carryNote}
        </p>

        <div className="mt-[22px] grid gap-[18px] items-start" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
          <div className="border border-[#e9e6de] rounded-[13px] p-[18px]">
            <div className="text-[13px] font-semibold">Card details</div>
            <label className="block mt-3.5">
              <span className="block text-[11px] font-semibold tracking-[0.09em] uppercase text-[#5f5f66]">Card number</span>
              <input
                type="text"
                defaultValue="4242 4242 4242 4242"
                className="mono mt-1.5 w-full h-10 rounded-[11px] border border-[#c6c6ce] px-[11px] text-[13.5px]"
              />
            </label>
            <div className="mt-[11px] grid grid-cols-3 gap-[9px]">
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-[0.09em] uppercase text-[#5f5f66]">Expiry</span>
                <input type="text" defaultValue="04 / 29" className="mono mt-1.5 w-full h-10 rounded-[11px] border border-[#c6c6ce] px-2.5 text-[13.5px]" />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-[0.09em] uppercase text-[#5f5f66]">CVC</span>
                <input type="text" defaultValue="314" className="mono mt-1.5 w-full h-10 rounded-[11px] border border-[#c6c6ce] px-2.5 text-[13.5px]" />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold tracking-[0.09em] uppercase text-[#5f5f66]">ZIP</span>
                <input type="text" defaultValue="78704" className="mono mt-1.5 w-full h-10 rounded-[11px] border border-[#c6c6ce] px-2.5 text-[13.5px]" />
              </label>
            </div>
            <div className="mt-3 text-[12.5px] text-[#5f5f66]">Stripe test mode. Nothing is charged in this demo.</div>
          </div>

          <div className="border border-[#e9e6de] rounded-[13px] p-[18px]">
            <div className="text-[13px] font-semibold">Order summary</div>
            <div className="mt-3 flex flex-col">
              {orderRows.map((r) => (
                <div key={r.k} className="flex items-baseline gap-3 py-[9px] border-b border-[#efede7]">
                  <span className="text-[12.5px]" style={{ color: r.color }}>{r.k}</span>
                  <span className="ml-auto mono text-[12.5px]" style={{ color: r.color }}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex items-baseline gap-3">
              <span className="text-[13px] font-semibold">Due today</span>
              <span className="ml-auto mono text-[19px]">${BUILD_FEE.toLocaleString('en-US')}</span>
            </div>
            <button
              onClick={onPay}
              disabled={paying}
              className="mt-4 w-full h-11 rounded-full border-none bg-[#146c43] text-white text-[13.5px] font-semibold cursor-pointer hover:bg-[#0f5132]"
            >
              {paying ? 'Opening Stripe…' : `Pay $${BUILD_FEE.toLocaleString('en-US')} and release the build`}
            </button>
            <button
              onClick={onBack}
              className="mt-2 w-full h-[38px] rounded-[11px] border border-[#c6c6ce] bg-white text-[12.5px] font-medium cursor-pointer"
            >
              Back to the website review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
