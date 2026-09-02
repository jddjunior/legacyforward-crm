'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/design/data';

const ROUTE_MAP: Record<string, string> = {
  dashboard: '/portal',
  copilot: '/portal/live-calls',
  tracking: '/portal/tracking',
  approvals: '/portal/approvals',
  leads: '/portal/leads',
  customers: '/portal/customers',
  pipeline: '/portal/pipeline',
  reviews: '/portal/reviews',
  website: '/portal/website',
  seo: '/portal/seo',
  socials: '/portal/socials',
  ads: '/portal/ads',
  services: '/portal/services',
  media: '/portal/media',
  documents: '/portal/documents',
  connections: '/portal/connections',
  profile: '/portal/profile',
  settings: '/portal/settings',
  logout: '/api/auth/logout',
};

function IconPath({ d, color, size = 18 }: { d: string; color: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flex: `0 0 ${size}px` }} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function Sidebar({
  brandName,
  userName,
  role = 'Owner',
  pendingCount = 0,
  liveCount = 0,
  wikiPct = 33,
  wikiNote = 'Upload your brand kit, photos, and pricing to give the agent what it needs.',
}: {
  brandName: string;
  userName: string;
  role?: string;
  pendingCount?: number;
  liveCount?: number;
  wikiPct?: number;
  wikiNote?: string;
}) {
  const pathname = usePathname();
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const groups = NAV.def.map((items, gi) => ({
    id: 'g' + gi,
    name: NAV.names[gi] || '',
    items: items.map(([id, label, badge]) => {
      const href = ROUTE_MAP[id] || '/portal';
      const active = id === 'dashboard' ? pathname === '/portal' : pathname === href;
      const displayBadge = id === 'approvals' ? (pendingCount ? String(pendingCount) : '') : id === 'copilot' ? (liveCount ? 'LIVE' : 'LIVE') : (badge || '');
      return {
        id, label, href, active,
        d: (NAV.icons as Record<string, string>)[id] || NAV.icons.dashboard,
        ink: active ? '#ffffff' : '#6b6b74',
        badge: displayBadge,
        style: {
          display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '11px 12px',
          border: 'none', borderRadius: '13px', cursor: 'pointer', fontSize: '14px',
          letterSpacing: '-0.012em', textAlign: 'left' as const, transition: 'background 140ms ease',
          background: active ? '#14141a' : 'transparent',
          color: active ? '#ffffff' : '#3f3f47',
          fontWeight: active ? 600 : 500,
        } as React.CSSProperties,
      };
    }),
  }));

  return (
    <aside style={{ width: 252, flex: '0 0 252px', background: '#ffffff', borderRight: '1px solid #eeece6', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: 'calc(100vh - 28px)', overflow: 'auto' }}>
      <div style={{ height: 72, flex: '0 0 72px', display: 'flex', alignItems: 'center', gap: 11, padding: '0 20px' }}>
        <span style={{ width: 32, height: 32, borderRadius: 11, background: '#14141a', color: '#ffc400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 32px' }}>LF</span>
        <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.03em' }}>{brandName}</span>
      </div>
      <button type="button" style={{ margin: '0 16px 14px 16px', display: 'flex', alignItems: 'center', gap: 9, height: 42, padding: '0 14px', borderRadius: 999, border: '1px solid #e6e2d8', background: '#ffffff', cursor: 'pointer', fontSize: 13.5, color: '#6b6b74' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 16, height: 16, flex: '0 0 16px' }} aria-hidden="true"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13M15.5 15.5 20 20" /></svg>
        <span>Search…</span>
        <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontSize: 12, color: '#6b6b74' }}>⌘K</span>
      </button>
      <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {groups.map(group => (
          <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ padding: '0 12px 7px 12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.11em', textTransform: 'uppercase', color: '#75737f' }}>{group.name}</div>
            {group.items.map(item => (
              <Link key={item.id} href={item.href} style={item.style} onClick={item.id === 'logout' ? (e) => { e.preventDefault(); window.location.href = '/api/auth/logout'; } : undefined}>
                <IconPath d={item.d} color={item.ink} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.badge ? (
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 11, fontWeight: 600, background: item.id === 'copilot' ? '#cf1c0c' : '#fff3d1', color: item.id === 'copilot' ? '#ffffff' : '#8a5a00', borderRadius: 999, minWidth: 20, textAlign: 'center', padding: '1px 6px' }}>{item.badge}</span>
                ) : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ margin: '14px 16px 0 16px', borderRadius: 13, padding: '18px 17px', background: 'linear-gradient(150deg,#0b3d26 0%,#12633c 52%,#1fa055 100%)', color: '#ffffff' }}>
        <span style={{ display: 'inline-flex', width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }} aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3.5z" /></svg>
        </span>
        <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.25 }}>Brand wiki {wikiPct}% built</div>
        <div style={{ marginTop: 7, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.84)' }}>{wikiNote}</div>
        <Link href="/portal/documents" style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 999, border: 'none', background: '#ffffff', color: '#14141a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Finish it
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }} aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </Link>
      </div>
      <Link href="/portal/profile" style={{ margin: '14px 16px 16px 16px', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 13, border: '1px solid #eeece6', background: '#ffffff', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ width: 36, height: 36, borderRadius: 999, flex: '0 0 36px', background: '#14141a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600 }}>{initials}</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{userName}</span>
          <span style={{ display: 'block', marginTop: 1, fontSize: 12, color: '#6b6b74' }}>{role}</span>
        </span>
        <span style={{ marginLeft: 'auto', color: '#75737f', fontSize: 15 }}>⋮</span>
      </Link>
    </aside>
  );
}
