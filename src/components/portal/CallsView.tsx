'use client';

import { useState } from 'react';

export interface CallRow {
  id: string;
  callerName: string;
  phone: string | null;
  repName: string | null;
  durationSec: number;
  status: string; // live, ended, missed
  sentiment: string | null;
  summary: string | null;
  startedAt: string; // ISO
  transcript: { who: string; text: string }[];
}

const STATUS_COLOR: Record<string, string> = { live: '#1fa055', ended: '#5f5f66', missed: '#b02a12' };

function mmss(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

// Live Calls — the copilot. Recent calls with transcript, sentiment,
// and the agent's summary. A live call pins to the top.
export default function CallsView({ calls }: { calls: CallRow[] }) {
  const [selectedId, setSelectedId] = useState(calls[0]?.id ?? null);
  const active = calls.find(c => c.id === selectedId) || calls[0] || null;

  if (!active) {
    return <div style={{ padding: '26px 20px', fontSize: 13, color: '#5f5f66' }}>No calls recorded yet — connect CallRail or take a call to see it here.</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', alignItems: 'stretch' }}>
      <div style={{ borderRight: '1px solid #e9e6de' }}>
        {calls.map(c => {
          const on = c.id === active.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px', borderBottom: '1px solid #efede7',
                background: on ? '#f1f8f3' : '#ffffff', borderLeft: on ? '3px solid #146c43' : '3px solid transparent', cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: STATUS_COLOR[c.status] || '#5f5f66', flex: '0 0 6px' }} aria-hidden="true" />
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.callerName}</span>
                {c.sentiment && c.sentiment !== '—' && (
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#1f6b18', background: '#e7f2ea', borderRadius: 999, padding: '2px 9px' }}>{c.sentiment}</span>
                )}
                <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66', whiteSpace: 'nowrap' }}>
                  {c.status === 'live' ? 'live' : mmss(c.durationSec)}
                </span>
              </span>
              <span style={{ display: 'block', marginTop: 3, fontSize: 12.5, color: '#5f5f66' }}>
                {c.phone || '—'} · {c.repName && c.repName !== '—' ? c.repName : 'unassigned'} · {new Date(c.startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '20px 24px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>{active.callerName}{active.repName && active.repName !== '—' ? ` × ${active.repName}` : ''}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: "'Geist Mono',monospace", fontSize: 11, letterSpacing: '0.11em', textTransform: 'uppercase', color: '#0f5132' }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: STATUS_COLOR[active.status] || '#5f5f66' }} aria-hidden="true" />
            {active.status === 'live' ? 'Live now' : active.status === 'missed' ? 'Missed' : `Ended · ${mmss(active.durationSec)}`}
          </span>
        </div>
        <div style={{ marginTop: 4, fontSize: 12.5, color: '#5f5f66' }}>{active.phone || '—'}</div>

        {active.transcript.length > 0 ? (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {active.transcript.map((t, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: t.who === 'rep' ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c5a52', marginBottom: 3 }}>{t.who === 'rep' ? (active.repName || 'Rep') : active.callerName.split(' ')[0]}</span>
                <span style={{ maxWidth: '86%', fontSize: 13.5, lineHeight: 1.55, color: '#2b2b33', background: t.who === 'rep' ? '#e7f2ea' : '#f7f6f2', borderRadius: 10, padding: '9px 12px' }}>{t.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 16, fontSize: 13, color: '#5f5f66' }}>No transcript available for this call.</div>
        )}

        {active.summary && (
          <div style={{ marginTop: 18, borderTop: '1px solid #efede7', paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f5f66' }}>Agent summary</div>
            <div style={{ marginTop: 7, fontSize: 13, lineHeight: 1.65, color: '#2b2b33' }}>{active.summary}</div>
          </div>
        )}
      </div>
    </div>
  );
}
