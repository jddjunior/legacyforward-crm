import { DEVICES, mapProposalPage, stripeBg, type ProposalPageDef } from './gateData';

// The staged website inside the review — browser frame with the client's
// proposal pages rendered as the future site.
export default function SiteMock({
  orgName,
  pages,
  activeIdx,
  device,
  onPickPage,
}: {
  orgName: string;
  pages: ProposalPageDef[];
  activeIdx: number;
  device: string;
  onPickPage: (i: number) => void;
}) {
  const dev = DEVICES.find((d) => d.id === device) || DEVICES[0];
  const page = mapProposalPage(pages[activeIdx] || pages[0]);

  return (
    <div className="flex-1 min-w-0 bg-[#eaeaef] p-[18px] overflow-auto flex justify-center">
      <div
        className="bg-white border border-[#c6c6ce] overflow-auto w-full"
        style={{
          width: dev.w,
          maxWidth: '100%',
          height: '100%',
          borderRadius: dev.id === 'mobile' ? 22 : 10,
          boxShadow: '0 8px 24px rgba(23,23,26,0.08)',
        }}
      >
        {/* Site header */}
        <div className="h-11 flex items-center gap-3.5 px-4 border-b border-[#e6e3dd] sticky top-0 bg-white z-[2]">
          <span className="text-[13px] font-bold tracking-[-0.01em] text-[#123] uppercase">{orgName}</span>
          <div className="flex-1" />
          {dev.nav && (
            <span className="flex gap-[13px]">
              {pages.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onPickPage(i)}
                  className={`bg-none border-none p-0 cursor-pointer text-[12px] ${
                    i === activeIdx ? 'font-semibold text-[#146c43]' : 'font-medium text-[#2b2b33]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </span>
          )}
        </div>

        {/* Page body */}
        <div style={{ padding: dev.pad }}>
          <div className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-[#8a5a00]">{page.eyebrow}</div>
          <h1
            className="mt-2.5 font-semibold tracking-[-0.03em] leading-[1.08] max-w-[16em] text-[#123]"
            style={{ fontSize: dev.h1 }}
          >
            {page.h1}
          </h1>
          <p className="mt-3 text-[14.5px] leading-[1.65] text-[#2b2b33] max-w-[34em]">{page.sub}</p>

          <div className="mt-4 flex gap-[9px] flex-wrap">
            <span className="h-10 px-[18px] rounded-full bg-[#146c43] text-white text-[13px] font-semibold inline-flex items-center">
              {page.cta}
            </span>
            <span className="h-10 px-4 rounded-full border border-[#d5d3cf] text-[13.5px] font-semibold inline-flex items-center text-[#123]">
              See recent work
            </span>
          </div>

          <div
            className="mt-5 rounded-[13px] flex items-end p-3"
            style={{ height: dev.hero, background: stripeBg }}
          >
            <span className="mono text-[12.5px] text-[#45454d] bg-white rounded-[5px] px-[7px] py-[3px]">{page.heroImg}</span>
          </div>

          {page.cards.length > 0 && (
            <div className="mt-[26px] grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
              {page.cards.map((c, i) => (
                <div key={i} className="border border-[#e6e3dd] rounded-[13px] p-[15px]">
                  <div className="text-[13.5px] font-semibold text-[#123]">{c.title}</div>
                  <div className="mt-1.5 text-[13px] leading-[1.65] text-[#45454d]">{c.body}</div>
                </div>
              ))}
            </div>
          )}

          {page.h2 && (
            <div className="mt-[26px] grid gap-5 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <div>
                <h2 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#123]">{page.h2}</h2>
                {page.paras.map((t, i) => (
                  <p key={i} className="mt-2.5 text-[13.5px] leading-[1.7] text-[#2b2b33]">
                    {t}
                  </p>
                ))}
              </div>
              <div className="h-[180px] rounded-[13px] flex items-end p-3" style={{ background: stripeBg }}>
                <span className="mono text-[12.5px] text-[#45454d] bg-white rounded-[5px] px-[7px] py-[3px]">{page.bodyImg}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
