'use client';

import Link from 'next/link';

export default function Header({ title, desc, pendingCount = 0 }: { title: string; desc: string; pendingCount?: number }) {
  return (
    <header style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '24px 28px 18px 28px', position: 'sticky', top: 0, background: 'rgba(246,245,241,0.93)', backdropFilter: 'blur(8px)', zIndex: 30 }}>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 34, fontWeight: 600, letterSpacing: '-0.038em', lineHeight: 1.1, color: '#14141a' }}>{title}</span>
        <span style={{ display: 'block', marginTop: 6, fontSize: 14, color: '#6b6b74' }}>{desc}</span>
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 15px', borderRadius: 999, border: '1px solid #e6e2d8', background: '#ffffff', fontSize: 13, fontWeight: 500, color: '#4a4a52' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#6b6b74" strokeWidth={1.7} strokeLinecap="round" style={{ width: 15, height: 15 }} aria-hidden="true"><path d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5zM4.5 9.5h15M9 5V3.5M15 5V3.5" /></svg>
        This month
      </span>
      <button type="button" style={{ height: 42, padding: '0 18px', borderRadius: 999, border: '1px solid #e6e2d8', background: '#ffffff', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Invite</button>
      <Link href="/portal/approvals" aria-label="Approvals" style={{ position: 'relative', width: 42, height: 42, borderRadius: 999, border: '1px solid #e6e2d8', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#14141a" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }} aria-hidden="true"><path d="M9 12.5l2.2 2.2L15.5 10M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z" /></svg>
        {pendingCount > 0 && (
          <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 19, height: 19, borderRadius: 999, background: '#cf1c0c', color: '#ffffff', fontFamily: "'Geist Mono',monospace", fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', border: '2px solid #f6f5f1' }}>{pendingCount}</span>
        )}
      </Link>
      <button type="button" aria-label="Quick actions" style={{ width: 46, height: 46, borderRadius: 999, border: 'none', background: '#14141a', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 19, height: 19 }} aria-hidden="true"><path d="M12 5.5v13M5.5 12h13" /></svg>
      </button>
    </header>
  );
}
