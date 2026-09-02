'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Inbox, Building2, FileText,
  Rocket, ListChecks, PenSquare, Monitor, Calendar, Megaphone, BarChart3,
  Bot, HeartPulse,
  Users, CreditCard, FileCode, ScrollText, Settings,
  Search as SearchIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | null;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    name: 'Agency',
    items: [
      { id: '/agency', label: 'Overview', icon: LayoutDashboard },
      { id: '/agency/inbox', label: 'Inbox', icon: Inbox },
      { id: '/agency/clients', label: 'Clients', icon: Building2 },
      { id: '/agency/proposals', label: 'Proposals', icon: FileText },
    ],
  },
  {
    name: 'Delivery',
    items: [
      { id: '/agency/onboarding', label: 'Onboarding', icon: Rocket },
      { id: '/agency/queue', label: 'Work Queue', icon: ListChecks },
      { id: '/agency/content', label: 'Content Studio', icon: PenSquare },
      { id: '/agency/pitchlive', label: 'Pitch Monitor', icon: Monitor },
      { id: '/agency/calendar', label: 'Calendar', icon: Calendar },
      { id: '/agency/adaccounts', label: 'Ad Accounts', icon: Megaphone },
      { id: '/agency/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    name: 'Intelligence',
    items: [
      { id: '/agency/agent', label: 'Agent Console', icon: Bot },
      { id: '/agency/health', label: 'Integration Health', icon: HeartPulse },
    ],
  },
  {
    name: 'Admin',
    items: [
      { id: '/agency/team', label: 'Team', icon: Users },
      { id: '/agency/billing', label: 'Billing', icon: CreditCard, badge: '1' },
      { id: '/agency/templates', label: 'Templates', icon: FileCode },
      { id: '/agency/audit', label: 'Audit Log', icon: ScrollText },
      { id: '/agency/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AgencySidebar({ userName = 'Account Director', pendingCount = 0 }: { userName?: string; pendingCount?: number }) {
  const pathname = usePathname();
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="w-[252px] flex-shrink-0 bg-white border-r border-[#eeece6] flex flex-col sticky top-0 h-[calc(100vh-28px)] overflow-auto">
      {/* Logo */}
      <div className="h-[72px] flex-shrink-0 flex items-center gap-[11px] px-5">
        <span className="w-8 h-8 rounded-[11px] bg-[#1fa055] text-[#06170f] flex items-center justify-center text-[12px] font-bold flex-shrink-0">LF</span>
        <span className="min-w-0">
          <span className="block text-[16px] font-semibold tracking-[-0.028em] text-[#14141a] truncate">Lantern Field</span>
          <span className="block mono text-[10px] tracking-[0.13em] uppercase text-[#6b6b74]">Agency console</span>
        </span>
      </div>

      {/* Search */}
      <button
        type="button"
        className="mx-4 mb-3.5 flex items-center gap-[9px] h-[42px] px-[14px] rounded-full border border-[#e6e2d8] bg-white text-[13.5px] text-[#6b6b74] hover:border-[#146c43] hover:text-[#146c43] transition-colors"
      >
        <SearchIcon size={16} className="flex-shrink-0" />
        <span>Search clients…</span>
        <span className="ml-auto mono text-[12px] text-[#6b6b74]">⌘K</span>
      </button>

      {/* Nav */}
      <nav className="px-3 flex flex-col gap-3.5 flex-1">
        {navGroups.map((group) => (
          <div key={group.name} className="flex flex-col gap-[3px]">
            <div className="px-3 pb-[7px] mono text-[10px] font-medium tracking-[0.14em] uppercase text-[#6b6b74]">{group.name}</div>
            {group.items.map((item) => {
              const active = pathname === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.id}
                  className={clsx(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-[11px] text-[13.5px] tracking-[-0.012em] text-left transition-colors',
                    active
                      ? 'bg-white text-[#0b3d26] font-semibold shadow-sm'
                      : 'text-[#14141a] font-medium hover:bg-[#f4f2f8]'
                  )}
                >
                  <Icon size={17} className="flex-shrink-0" strokeWidth={1.7} />
                  <span className="flex-1 text-left min-w-0 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto mono text-[10.5px] font-semibold rounded-full px-[7px] py-[2px] bg-[#f2efe8] text-[#6b6b74]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Needs you alert card */}
      {pendingCount > 0 && (
        <div
          className="mx-4 mt-3.5 rounded-[13px] p-4"
          style={{ background: 'linear-gradient(150deg, #0b3d26 0%, #12633c 52%, #1fa055 100%)' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-[7px] h-[7px] rounded-full bg-[#ff6b4a]" />
            <span className="mono text-[10px] font-medium tracking-[0.13em] uppercase text-white/82">Needs you</span>
          </div>
          <div className="mt-2.5 text-[16px] font-semibold tracking-[-0.025em] leading-[1.3] text-white">
            {pendingCount} items waiting
          </div>
          <div className="mt-1.5 text-[12px] leading-[1.5] text-white/80">Approvals and change requests need your attention.</div>
          <Link
            href="/agency/queue"
            className="mt-3 inline-flex items-center gap-[7px] h-[34px] px-3.5 rounded-full bg-white text-[#0b3d26] text-[12.5px] font-semibold hover:bg-white/90 transition-colors"
          >
            Triage now
          </Link>
        </div>
      )}

      {/* User chip */}
      <Link
        href="/agency/settings"
        className="mx-4 my-3.5 flex items-center gap-[11px] px-3 py-2.5 rounded-[13px] border border-[#eeece6] bg-white hover:border-[#e0dbea] transition-colors text-left"
      >
        <span className="w-[34px] h-[34px] rounded-full bg-[#1fa055] text-[#06170f] flex items-center justify-center text-[12px] font-bold flex-shrink-0">{initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold tracking-[-0.01em] text-[#14141a] truncate">{userName}</span>
          <span className="block mt-[1px] text-[11.5px] text-[#6b6b74]">Account director</span>
        </span>
        <span className="text-[#6b6b74] text-[14px]">⋮</span>
      </Link>
    </aside>
  );
}
