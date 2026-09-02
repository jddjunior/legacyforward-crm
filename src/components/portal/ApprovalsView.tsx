'use client';

import { useState, useTransition } from 'react';
import { approveItem, rejectItem } from '@/app/actions/approvals';

export interface ApprovalRow {
  id: string;
  kind: string;
  title: string;
  body: string;
  asset: string;
  status: string;
  meta: string;
  rows: { k: string; v: string }[];
}

export default function ApprovalsView({ approvals }: { approvals: ApprovalRow[] }) {
  const [activeId, setActiveId] = useState(approvals[0]?.id || '');
  const [feedback, setFeedback] = useState('');
  const [approvalState, setApprovalState] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  const active = approvals.find(a => a.id === activeId) || approvals[0];
  if (!active) {
    return <div style={{ padding: '32px 24px', fontSize: 13, color: '#5f5f66' }}>No approval requests yet.</div>;
  }

  const statusOf = (a: ApprovalRow) => approvalState[a.id] || (a.status === 'approved' ? 'Approved' : a.status === 'rejected' ? 'Changes requested' : 'Awaiting you');
  const dotOf = (st: string) => (st === 'Approved' ? '#1f6b18' : st === 'Changes requested' ? '#b02a12' : '#ffc400');
  const inkOf = (st: string) => (st === 'Approved' ? '#1f6b18' : st === 'Changes requested' ? '#b02a12' : '#8a5a00');

  const approve = (id: string) => {
    setApprovalState(s => ({ ...s, [id]: 'Approved' }));
    setFeedback('');
    startTransition(() => { approveItem(id); });
  };
  const requestChanges = (id: string) => {
    setApprovalState(s => ({ ...s, [id]: 'Changes requested' }));
    setFeedback('');
    startTransition(() => { rejectItem(id); });
  };

  const activeStatus = statusOf(active);
  const activeInk = activeStatus === 'Approved' ? '#1f6b18' : activeStatus === 'Changes requested' ? '#b02a12' : '#8a5a00';
  const activeDot = dotOf(activeStatus);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', alignItems: 'stretch' }}>
      <div style={{ borderRight: '1px solid #e9e6de' }}>
        {approvals.map(a => {
          const st = statusOf(a);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setActiveId(a.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '13px 20px', border: 'none', borderBottom: '1px solid #efede7',
                background: a.id === activeId ? '#f1f8f3' : 'transparent', cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: dotOf(st), flex: '0 0 5px' }} aria-hidden="true" />
                <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 0 }}>{a.title}</span>
                <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66', whiteSpace: 'nowrap' }}>{a.kind}</span>
              </span>
              <span style={{ display: 'block', marginTop: 4, paddingLeft: 15, fontSize: 12.5, color: '#5f5f66' }}>{a.meta}</span>
            </button>
          );
        })}
      </div>
      <div style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#146c43' }}>{active.kind}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: activeInk }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: activeDot }} aria-hidden="true" />
            {activeStatus}
          </span>
        </div>
        <h2 style={{ margin: '10px 0 0 0', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>{active.title}</h2>
        <div style={{ marginTop: 16, height: 150, borderRadius: 13, background: 'repeating-linear-gradient(135deg,#f6f5f2 0 8px,#eeece7 8px 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5c5a52' }}>{active.asset}</div>
        <p style={{ margin: '16px 0 0 0', fontSize: 13.5, lineHeight: 1.7, color: '#2b2b33', maxWidth: 620 }}>{active.body}</p>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 520 }}>
          {active.rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, fontSize: 12.5, padding: '8px 0', borderBottom: '1px solid #efede7' }}>
              <span style={{ color: '#5f5f66', minWidth: 110 }}>{r.k}</span>
              <span>{r.v}</span>
            </div>
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Notes for your team (optional)"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          style={{ marginTop: 16, width: '100%', maxWidth: 620, borderRadius: 11, border: '1px solid #c6c6ce', padding: 10, fontSize: 13, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', color: 'inherit' }}
        />
        <div style={{ marginTop: 14, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => approve(active.id)}
            style={{ height: 38, padding: '0 17px', borderRadius: 11, border: 'none', background: '#146c43', color: '#ffffff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => requestChanges(active.id)}
            style={{ height: 38, padding: '0 15px', borderRadius: 11, border: '1px solid #c6c6ce', background: '#ffffff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            Request changes
          </button>
        </div>
      </div>
    </div>
  );
}
