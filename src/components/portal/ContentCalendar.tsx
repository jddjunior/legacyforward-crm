'use client';

import { useState, useTransition } from 'react';
import { approvePost, requestPostChanges } from '@/app/actions/content';

export interface CalPost {
  id: string;
  platform: string;
  title: string;
  copy: string | null;
  status: string;
  scheduledFor: string; // ISO
}

const DOT: Record<string, string> = {
  awaiting_approval: '#ffc400',
  approved: '#1f6b18',
  changes_requested: '#b02a12',
  published: '#146c43',
};

const LABEL: Record<string, string> = {
  awaiting_approval: 'Awaiting approval',
  approved: 'Approved',
  changes_requested: 'Changes requested',
  published: 'Published',
};

// The socials / ads flight calendar. Click any item to review it,
// approve it for scheduling, or flag it back to the agency.
export default function ContentCalendar({ posts, monthLabel }: { posts: CalPost[]; monthLabel: string }) {
  const [items, setItems] = useState(posts);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const active = items.find(p => p.id === openId) || null;

  // Month grid for the current month, Sunday-first.
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const cells: { day: number | null; posts: CalPost[] }[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, posts: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPosts = items
      .filter(p => { const t = new Date(p.scheduledFor); return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d; })
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
    cells.push({ day: d, posts: dayPosts });
  }

  function onApprove(id: string) {
    setItems(xs => xs.map(x => (x.id === id ? { ...x, status: 'approved' } : x)));
    setOpenId(null);
    startTransition(() => { approvePost(id); });
  }

  function onRequestChanges(id: string) {
    setItems(xs => xs.map(x => (x.id === id ? { ...x, status: 'changes_requested' } : x)));
    setOpenId(null);
    startTransition(() => { requestPostChanges(id); });
  }

  return (
    <div>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', borderBottom: '1px solid #e9e6de', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{monthLabel}</span>
        {[['Awaiting approval', '#ffc400'], ['Approved', '#1f6b18'], ['Changes requested', '#b02a12']].map(([label, color]) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#45454d' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: color }} aria-hidden="true" />{label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#5f5f66' }}>{items.length} scheduled · click to review</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', borderBottom: '1px solid #e9e6de' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ padding: '7px 10px', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5f5f66' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))' }}>
        {cells.map((cell, i) => (
          <div key={i} style={{ minHeight: 96, padding: '7px 8px', borderRight: '1px solid #efede7', borderBottom: '1px solid #efede7', background: cell.day === now.getDate() ? '#f7faf6' : '#ffffff' }}>
            {cell.day != null && (
              <div style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: cell.day === now.getDate() ? '#146c43' : '#5f5f66', fontWeight: cell.day === now.getDate() ? 600 : 400 }}>{cell.day}</div>
            )}
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cell.posts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpenId(p.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 7px', borderRadius: 7, border: '1px solid #e9e6de', background: '#ffffff', cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 4, height: 4, borderRadius: 999, background: DOT[p.status] || '#5f5f66', flex: '0 0 4px' }} aria-hidden="true" />
                    <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66' }}>
                      {new Date(p.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </span>
                  <span style={{ display: 'block', marginTop: 2, fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <>
          <button type="button" aria-label="Close review" onClick={() => setOpenId(null)} style={{ position: 'fixed', inset: 0, zIndex: 40, border: 'none', background: 'rgba(23,23,26,0.28)', cursor: 'pointer' }} />
          <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '92vw', zIndex: 41, background: '#ffffff', borderLeft: '1px solid #e9e6de', boxShadow: '-24px 0 60px rgba(23,23,26,0.12)', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#45454d', border: '1px solid #e9e6de', borderRadius: 4, padding: '1px 5px' }}>{active.platform.replace('_', ' ')}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: DOT[active.status] || '#5f5f66' }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: DOT[active.status] || '#5f5f66' }} aria-hidden="true" />{LABEL[active.status] || active.status}
              </span>
              <button type="button" onClick={() => setOpenId(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: '#5f5f66' }} aria-label="Close">×</button>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>{active.title}</div>
              <div style={{ marginTop: 4, fontSize: 12.5, color: '#5f5f66' }}>
                {new Date(active.scheduledFor).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
            {active.copy && (
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: '#2b2b33', background: '#f7f6f2', borderRadius: 9, padding: '12px 14px' }}>{active.copy}</div>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => onRequestChanges(active.id)} style={{ height: 38, padding: '0 15px', borderRadius: 11, border: '1px solid #c6c6ce', background: '#ffffff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Request changes</button>
              <button type="button" onClick={() => onApprove(active.id)} style={{ height: 38, padding: '0 17px', borderRadius: 11, border: 'none', background: '#146c43', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Approve</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
