'use client';

import { useMemo, useState } from 'react';
import { CONN_DEFS, SETUP_PANE_COPY, TECH_DEFS, UPLOAD_DEFS } from './gateData';

export interface GatewayReview {
  id: string;
  author: string;
  platform: string;
  rating: number;
  text: string;
}

type SetupTab = 'brand' | 'tech' | 'conn' | 'reviews';

// Stage 04 — onboarding: uploads, tech selection, connections, and review approval.
export default function SetupStage({ reviews, onEnter }: { reviews: GatewayReview[]; onEnter: () => void }) {
  const [setupTab, setSetupTab] = useState<SetupTab>('brand');
  const [uploads, setUploads] = useState<Record<string, boolean>>({});
  const [tech, setTech] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [reviewState, setReviewState] = useState<Record<string, string>>({});

  const uploadRows = UPLOAD_DEFS.map((u) => {
    const on = !!uploads[u.id];
    const optional = u.id === 'kit';
    return {
      ...u,
      state: on ? 'Received' : optional ? 'Optional' : 'Needed',
      color: on ? '#1f6b18' : optional ? '#5f5f66' : '#8a5a00',
      action: on ? 'Replace' : 'Add files',
    };
  });

  const connectedCount = CONN_DEFS.filter((c) => connected[c.id]).length;
  const pendingReviews = reviews.filter((r) => (reviewState[r.id] || 'Pending your read') === 'Pending your read').length;

  const tabs: { id: SetupTab; label: string; hint: string; done: boolean }[] = [
    {
      id: 'brand',
      label: 'Brand and data',
      hint: `${uploadRows.filter((u) => u.state === 'Received').length} of 6 received`,
      done: uploadRows.every((u) => u.state !== 'Needed'),
    },
    {
      id: 'tech',
      label: 'Software and tech',
      hint: TECH_DEFS.map((t) => tech[t.key] || '—').join(', '),
      done: TECH_DEFS.every((t) => tech[t.key]),
    },
    {
      id: 'conn',
      label: 'Connections',
      hint: `${connectedCount} of 12 live`,
      done: connectedCount >= 9,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      hint: `${reviews.length} pulled · ${pendingReviews} to read`,
      done: reviews.length > 0 && pendingReviews === 0,
    },
  ];

  const setupDone = tabs.filter((t) => t.done).length;
  const pane = SETUP_PANE_COPY[setupTab];

  const sources = useMemo(() => {
    const groups: Record<string, GatewayReview[]> = {};
    reviews.forEach((r) => {
      (groups[r.platform] ||= []).push(r);
    });
    return Object.entries(groups).map(([name, list]) => ({
      name,
      avg: (list.reduce((a, r) => a + r.rating, 0) / list.length).toFixed(1),
      count: list.length,
    }));
  }, [reviews]);

  return (
    <div className="flex-1 min-h-0 overflow-auto px-[30px] py-[26px]">
      <div className="text-[11.5px] font-semibold tracking-[0.14em] uppercase text-[#146c43]">Step 04 · Onboarding</div>
      <h2 className="mt-[11px] text-[25px] font-normal tracking-[-0.025em]">
        Load your material, connect your platforms, pull your reviews
      </h2>
      <p className="mt-2.5 text-sm leading-[1.65] text-[#45454d] max-w-[660px]">
        This builds your brand wiki and the databases behind every asset we produce. Finish these and the portal behind
        this window opens.
      </p>

      <div className="mt-[22px] grid gap-5 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        {/* Tabs */}
        <div className="border border-[#e9e6de] rounded-[13px] overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSetupTab(t.id)}
              className={`block w-full text-left py-3 px-3.5 border-none border-b border-[#efede7] cursor-pointer ${
                setupTab === t.id ? 'bg-[#f1f8f3]' : 'bg-white'
              }`}
            >
              <span className="flex items-center gap-[9px]">
                <span
                  className="w-4 h-4 rounded-full flex-none flex items-center justify-center text-[11.5px]"
                  style={{ background: t.done ? '#e7f2ea' : '#eaeaef', color: t.done ? '#1f6b18' : '#5f5f66' }}
                >
                  {t.done ? '✓' : '·'}
                </span>
                <span className="text-[13.5px] font-semibold">{t.label}</span>
              </span>
              <span className="block mt-1 pl-[25px] text-[12.5px] text-[#5f5f66]">{t.hint}</span>
            </button>
          ))}
        </div>

        {/* Pane */}
        <div className="border border-[#e9e6de] rounded-[13px] p-[18px] min-w-0">
          <div className="text-[14.5px] font-semibold tracking-[-0.01em]">{pane.title}</div>
          <div className="mt-1.5 text-[13px] leading-[1.65] text-[#45454d]">{pane.body}</div>

          {setupTab === 'brand' && (
            <div className="mt-4 flex flex-col">
              {uploadRows.map((u) => (
                <div key={u.id} className="flex items-center gap-3 py-[11px] border-b border-[#efede7] flex-wrap">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium">{u.name}</div>
                    <div className="mt-[3px] text-[12.5px] text-[#5f5f66]">{u.detail}</div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-[7px] text-[12px] whitespace-nowrap" style={{ color: u.color }}>
                    <span className="w-[5px] h-[5px] rounded-full" style={{ background: u.color }} />
                    {u.state}
                  </span>
                  <button
                    onClick={() => setUploads({ ...uploads, [u.id]: true })}
                    className="h-[30px] px-3 rounded-[11px] border border-[#c6c6ce] bg-white text-[12px] font-medium cursor-pointer whitespace-nowrap"
                  >
                    {u.action}
                  </button>
                </div>
              ))}
            </div>
          )}

          {setupTab === 'tech' && (
            <div className="mt-4 flex flex-col gap-[15px]">
              {TECH_DEFS.map((t) => (
                <div key={t.key}>
                  <div className="text-[11px] font-semibold tracking-[0.09em] uppercase text-[#5f5f66]">{t.label}</div>
                  <div className="mt-[7px] flex gap-[7px] flex-wrap">
                    {t.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => setTech({ ...tech, [t.key]: o })}
                        className={`h-8 px-[13px] rounded-[11px] cursor-pointer text-[12.5px] font-medium border ${
                          tech[t.key] === o
                            ? 'border-[#111116] bg-[#111116] text-white'
                            : 'border-[#e6e4ec] bg-white text-[#2b2b33]'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {setupTab === 'conn' && (
            <div className="mt-3.5 flex flex-col">
              {CONN_DEFS.map((c) => {
                const on = !!connected[c.id];
                return (
                  <div key={c.id} className="flex items-center gap-3 py-2.5 border-b border-[#efede7]">
                    <span className="w-[26px] h-[26px] rounded-[8px] bg-[#eaeaef] text-[#111116] flex items-center justify-center text-[11.5px] font-bold">
                      {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium">{c.name}</div>
                      <div className="mt-[2px] text-[12.5px] text-[#5f5f66]">{c.role}</div>
                    </div>
                    <button
                      onClick={() => setConnected({ ...connected, [c.id]: !on })}
                      className={`ml-auto h-[30px] px-3 rounded-[11px] text-[12px] font-medium cursor-pointer border ${
                        on
                          ? 'bg-[#e7f2ea] text-[#1f6b18] border-[#e7f2ea]'
                          : 'border-[#c6c6ce] bg-white text-[#111116]'
                      }`}
                    >
                      {on ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {setupTab === 'reviews' && (
            <div className="mt-3.5">
              <div className="flex items-center gap-[9px] flex-wrap">
                {sources.map((s) => (
                  <span key={s.name} className="inline-flex items-center gap-1.5 border border-[#e9e6de] rounded-[11px] px-2.5 py-1.5 text-[12px]">
                    <span className="font-medium capitalize">{s.name}</span>
                    <span className="mono text-[#5f5f66]">
                      {s.avg} · {s.count}
                    </span>
                  </span>
                ))}
                <button className="ml-auto h-8 px-[13px] rounded-[11px] border border-[#c6c6ce] bg-white text-[12.5px] font-medium cursor-pointer">
                  Re-pull all
                </button>
              </div>
              <div className="mt-3.5 flex flex-col">
                {reviews.map((r) => {
                  const st = reviewState[r.id] || 'Pending your read';
                  const color = st === 'Published' ? '#1f6b18' : st === 'Off site' ? '#5f5f66' : st === 'Reply drafted' ? '#2a49b8' : '#8a5a00';
                  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
                  return (
                    <div key={r.id} className="flex gap-3 items-start py-3 border-b border-[#efede7] flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-[9px] flex-wrap">
                          <span className="text-[12.5px] font-medium">{r.author}</span>
                          <span className="mono text-[13px] text-[#8a5a00]">{stars}</span>
                          <span className="text-[12.5px] text-[#5f5f66] capitalize">{r.platform}</span>
                          <span className="inline-flex items-center gap-1.5 text-[12.5px]" style={{ color }}>
                            <span className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />
                            {st}
                          </span>
                        </div>
                        <div className="mt-[5px] text-[13px] leading-[1.65] text-[#2b2b33]">{r.text}</div>
                      </div>
                      <div className="flex gap-[7px]">
                        <button
                          onClick={() => setReviewState({ ...reviewState, [r.id]: 'Published' })}
                          className="h-[29px] px-[11px] rounded-[11px] border border-[#c6c6ce] bg-white text-[12px] font-medium cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewState({ ...reviewState, [r.id]: 'Off site' })}
                          className="h-[29px] px-[11px] rounded-[11px] border border-[#c6c6ce] bg-white text-[12px] font-medium cursor-pointer"
                        >
                          Exclude
                        </button>
                      </div>
                    </div>
                  );
                })}
                {reviews.length === 0 && (
                  <div className="py-4 text-[12.5px] text-[#5f5f66] leading-[1.6]">No reviews pulled yet for this account.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2.5 items-center flex-wrap">
        <button
          onClick={onEnter}
          className="h-11 px-5 rounded-full border-none cursor-pointer text-[13.5px] font-semibold"
          style={{
            background: setupDone >= 3 ? '#146c43' : '#eaeaef',
            color: setupDone >= 3 ? '#ffffff' : '#45454d',
          }}
        >
          {setupDone >= 3 ? 'Enter your portal' : 'Enter your portal anyway'}
        </button>
        <span className="text-[12.5px] text-[#5f5f66]">
          {setupDone} of 4 setup steps complete
        </span>
      </div>
    </div>
  );
}
