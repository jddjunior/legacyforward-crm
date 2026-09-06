'use client';

import { useState } from 'react';
import { DEVICES, type ProposalPageDef } from './gateData';
import SiteMock from './SiteMock';

export interface ChangeRequest {
  id: string;
  text: string;
  pageId: string;
  page: string;
  device: string;
}

// Stage 01 — website review: page nav, device toggles, the staged site,
// and the change-request drawer.
export default function PreviewStage({
  orgName,
  pages,
  changes,
  onAddChange,
  onRemoveChange,
  onApprove,
}: {
  orgName: string;
  pages: ProposalPageDef[];
  changes: ChangeRequest[];
  onAddChange: (rec: ChangeRequest) => void;
  onRemoveChange: (id: string) => void;
  onApprove: () => void;
}) {
  const [device, setDevice] = useState('desktop');
  const [activeIdx, setActiveIdx] = useState(0);
  const [changesOpen, setChangesOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const dev = DEVICES.find((d) => d.id === device) || DEVICES[0];
  const activePage = pages[activeIdx];
  const pageLabel = activePage?.name || 'Page';
  const pageChanges = changes.filter((c) => c.pageId === pageLabel).length;

  function addChange() {
    const text = draft.trim();
    if (!text) return;
    onAddChange({
      id: 'c' + Date.now(),
      text,
      pageId: pageLabel,
      page: pageLabel,
      device: dev.label,
    });
    setDraft('');
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Toolbar */}
      <div className="h-[46px] flex-none flex items-center gap-2.5 px-3 border-b border-[#e9e6de]">
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto">
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-[30px] px-3 rounded-[11px] cursor-pointer text-[12.5px] font-medium whitespace-nowrap border ${
                i === activeIdx
                  ? 'border-[#111116] bg-[#111116] text-white'
                  : 'border-[#e6e4ec] bg-white text-[#2b2b33]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex-none flex gap-[3px] p-[3px] rounded-[11px] bg-[#eaeaef]">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              className={`h-[26px] px-[11px] rounded-md border-none cursor-pointer text-[12px] font-medium ${
                device === d.id ? 'bg-white text-[#111116]' : 'bg-transparent text-[#45454d]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setChangesOpen(!changesOpen)}
          className={`flex-none h-8 px-[13px] rounded-[11px] cursor-pointer text-[12.5px] font-medium whitespace-nowrap border ${
            changesOpen
              ? 'border-[#111116] bg-[#111116] text-[#ffc400]'
              : 'border-[#c6c6ce] bg-white text-[#111116]'
          }`}
        >
          Changes {changes.length ? `(${changes.length})` : ''}
        </button>
        <button
          onClick={onApprove}
          className="flex-none h-8 px-[15px] rounded-full border-none bg-[#146c43] text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap hover:bg-[#0f5132]"
        >
          Approve
        </button>
      </div>

      {/* Site + drawer */}
      <div className="flex-1 min-h-0 flex">
        <SiteMock orgName={orgName} pages={pages} activeIdx={activeIdx} device={device} onPickPage={setActiveIdx} />

        {changesOpen && (
          <div className="w-[308px] flex-none border-l border-[#e9e6de] flex flex-col min-h-0">
            <div className="h-[42px] flex-none flex items-center gap-2 px-3.5 border-b border-[#e9e6de]">
              <span className="text-[12.5px] font-semibold">Change requests</span>
              <span className="mono text-[12.5px] text-[#5f5f66]">{changes.length}</span>
              <button
                onClick={() => setChangesOpen(false)}
                aria-label="Close"
                className="ml-auto w-6 h-6 rounded-md border border-[#e9e6de] bg-white text-[13px] cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="px-3.5 py-3 border-b border-[#e9e6de]">
              <div className="text-[12.5px] text-[#5f5f66] leading-[1.5]">
                Anything you add here is attached to <strong className="text-[#111116] font-semibold">{pageLabel}</strong> and applied after
                purchase — approving does not lose them.
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="e.g. Swap the hero photo for a crew shot and soften the offer line."
                className="mt-[9px] w-full rounded-[11px] border border-[#c6c6ce] p-[9px] text-[13px] leading-[1.6] resize-y"
              />
              <button
                onClick={addChange}
                className="mt-2 w-full h-[34px] rounded-[11px] border-none bg-[#146c43] text-white text-[12.5px] font-semibold cursor-pointer"
              >
                Add to the list
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              {[...changes].reverse().map((c) => (
                <div key={c.id} className="px-3.5 py-[11px] border-b border-[#efede7]">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[12px] text-[#45454d] border border-[#e9e6de] rounded px-[5px] py-px">{c.page}</span>
                    <span className="mono text-[12.5px] text-[#5f5f66]">{c.device}</span>
                    <button
                      onClick={() => onRemoveChange(c.id)}
                      className="ml-auto bg-none border-none text-[#b02a12] text-[11.5px] font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-1.5 text-[13px] leading-[1.6] text-[#2b2b33]">{c.text}</div>
                </div>
              ))}
              {changes.length === 0 && (
                <div className="px-3.5 py-5 text-[12.5px] text-[#5f5f66] leading-[1.6]">
                  No requests yet. Click through the pages, switch to mobile, and note anything you want changed.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-10 flex-none flex items-center gap-3.5 px-3.5 border-t border-[#e9e6de] bg-[#f7f6f2]">
        <span className="text-[12.5px] text-[#5f5f66]">
          Reviewing {pageLabel} · {dev.label} · {pageChanges} request{pageChanges === 1 ? '' : 's'} on this page ·{' '}
          {changes.length} total
        </span>
        <div className="flex-1" />
        <span className="text-[12.5px] text-[#5f5f66]">
          Your CRM is behind this window — it unlocks after payment and onboarding.
        </span>
      </div>
    </div>
  );
}
