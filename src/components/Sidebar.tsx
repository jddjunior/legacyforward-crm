'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Phone, Crosshair, ShieldCheck, User, Users,
  BarChart3, Star, Globe, Search, MessageCircle, Megaphone,
  Package, ImageIcon, FileText, Link2, UserCircle, Settings, LogOut,
  Search as SearchIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | null;
  badgeKind?: 'live' | 'count';
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    name: 'Overview',
    items: [
      { id: '/portal', label: 'Dashboard', icon: LayoutDashboard },
      { id: '/portal/live-calls', label: 'Live Calls', icon: Phone, badge: 'LIVE', badgeKind: 'live' },
      { id: '/portal/tracking', label: 'Lead Tracking', icon: Crosshair },
      { id: '/portal/approvals', label: 'Approvals', icon: ShieldCheck, badge: null, badgeKind: 'count' },
      { id: '/portal/leads', label: 'Leads', icon: User },
      { id: '/portal/customers', label: 'Customers', icon: Users },
      { id: '/portal/pipeline', label: 'Pipeline', icon: BarChart3 },
      { id: '/portal/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    name: 'Marketing',
    items: [
      { id: '/portal/website', label: 'Website', icon: Globe },
      { id: '/portal/seo', label: 'SEO', icon: Search },
      { id: '/portal/socials', label: 'Socials', icon: MessageCircle },
      { id: '/portal/ads', label: 'Ads', icon: Megaphone },
    ],
  },
  {
    name: 'Catalog',
    items: [
      { id: '/portal/services', label: 'Services', icon: Package },
      { id: '/portal/media', label: 'Media', icon: ImageIcon },
      { id: '/portal/documents', label: 'Documents', icon: FileText },
    ],
  },
  {
    name: 'Account',
    items: [
      { id: '/portal/connections', label: 'Connections', icon: Link2 },
      { id: '/portal/profile', label: 'Profile', icon: UserCircle },
      { id: '/portal/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({
  userName,
  orgName,
  pendingCount = 0,
  wikiPct = 0,
}: {
  userName: string;
  orgName: string;
  pendingCount?: number;
  wikiPct?: number;
}) {
  const pathname = usePathname();
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Set badge counts
  const approvalsItem = navGroups[0].items.find(i => i.id === '/portal/approvals');
  if (approvalsItem) approvalsItem.badge = pendingCount > 0 ? String(pendingCount) : null;

  return (
    <aside className="w-[252px] flex-shrink-0 bg-white border-r border-[#eeece6] flex flex-col sticky top-0 h-[calc(100vh-28px)] overflow-auto">
      {/* Logo */}
      <div className="h-[72px] flex-shrink-0 flex items-center gap-[11px] px-5">
        <span className="w-8 h-8 rounded-[11px] bg-[#14141a] text-[#ffc400] flex items-center justify-center text-[12px] font-bold flex-shrink-0">LF</span>
        <span className="text-[19px] font-semibold tracking-[-0.03em] truncate">{orgName}</span>
      </div>

      {/* Search / Command palette */}
      <button
        type="button"
        className="mx-4 mb-3.5 flex items-center gap-[9px] h-[42px] px-[14px] rounded-full border border-[#e6e2d8] bg-white text-[13.5px] text-[#6b6b74] hover:border-[#146c43] hover:text-[#146c43] transition-colors"
      >
        <SearchIcon size={16} className="flex-shrink-0" />
        <span>Search…</span>
        <span className="ml-auto mono text-[12px] text-[#6b6b74]">⌘K</span>
      </button>

      {/* Nav */}
      <nav className="px-3 flex flex-col gap-3.5 flex-1">
        {navGroups.map((group) => (
          <div key={group.name} className="flex flex-col gap-[3px]">
            <div className="px-3 pb-[7px] text-[11px] font-semibold tracking-[0.11em] uppercase text-[#75737f]">{group.name}</div>
            {group.items.map((item) => {
              const active = pathname === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.id}
                  className={clsx(
                    'flex items-center gap-3 w-full px-3 py-[11px] rounded-[13px] text-[14px] tracking-[-0.012em] text-left transition-colors',
                    active
                      ? 'bg-[#14141a] text-white font-semibold'
                      : 'text-[#3f3f47] font-medium hover:bg-[#f4f2f8]'
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" strokeWidth={1.7} />
                  <span className="flex-1 text-left min-w-0 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={clsx(
                        'mono text-[11px] font-semibold rounded-full min-w-[20px] text-center px-1.5 py-[1px]',
                        item.badgeKind === 'live'
                          ? 'bg-[#cf1c0c] text-white'
                          : 'bg-[#fff3d1] text-[#8a5a00]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Brand wiki card */}
      <div
        className="mx-4 mt-3.5 rounded-[13px] p-[18px_17px] text-white"
        style={{ background: 'linear-gradient(150deg, #0b3d26 0%, #12633c 52%, #1fa055 100%)' }}
      >
        <span className="inline-flex w-[30px] h-[30px] rounded-[9px] bg-white/15 items-center justify-center">
          <FileText size={16} strokeWidth={1.8} />
        </span>
        <div className="mt-3 text-[18px] font-semibold tracking-[-0.025em] leading-[1.25]">Brand wiki {wikiPct}% built</div>
        <div className="mt-[7px] text-[12.5px] leading-[1.5] text-white/85">
          {wikiPct < 100 ? 'Upload more documents to finish your knowledge base.' : 'Your brand wiki is complete.'}
        </div>
        <Link
          href="/portal/documents"
          className="mt-3.5 inline-flex items-center gap-2 h-[38px] px-4 rounded-full bg-white text-[#14141a] text-[13px] font-semibold hover:bg-white/90 transition-colors"
        >
          {wikiPct < 100 ? 'Finish it' : 'View'}
        </Link>
      </div>

      {/* User chip */}
      <Link
        href="/portal/profile"
        className="mx-4 my-3.5 flex items-center gap-[11px] px-3 py-2.5 rounded-[13px] border border-[#eeece6] bg-white hover:border-[#e0dbea] transition-colors text-left"
      >
        <span className="w-9 h-9 rounded-full bg-[#14141a] text-white flex items-center justify-center text-[12.5px] font-semibold flex-shrink-0">{initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold tracking-[-0.01em] truncate">{userName}</span>
          <span className="block mt-[1px] text-[12px] text-[#6b6b74]">Owner</span>
        </span>
        <span className="text-[#75737f] text-[15px]">⋮</span>
      </Link>

      {/* Logout */}
      <form action="/api/auth/logout" method="POST" className="px-4 pb-3.5">
        <button type="submit" className="flex items-center gap-3 w-full px-3 py-[11px] rounded-[13px] text-[14px] font-medium text-[#3f3f47] hover:bg-[#f4f2f8] transition-colors">
          <LogOut size={18} strokeWidth={1.7} />
          <span>Logout</span>
        </button>
      </form>
    </aside>
  );
}
