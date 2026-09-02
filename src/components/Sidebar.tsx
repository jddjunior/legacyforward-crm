'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Phone, CheckSquare, Users, User, GitBranch,
  Star, Globe, Search, Calendar, Megaphone, Package, FolderOpen,
  FileText, Link2, Settings, LogOut,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: '/portal', label: 'Dashboard', icon: LayoutDashboard },
      { id: '/portal/live-calls', label: 'Live Calls', icon: Phone, badge: 'LIVE' },
      { id: '/portal/approvals', label: 'Approvals', icon: CheckSquare, badge: null },
    ],
  },
  {
    label: 'CRM',
    items: [
      { id: '/portal/leads', label: 'Leads', icon: User },
      { id: '/portal/customers', label: 'Customers', icon: Users },
      { id: '/portal/pipeline', label: 'Pipeline', icon: GitBranch },
      { id: '/portal/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { id: '/portal/website', label: 'Website', icon: Globe },
      { id: '/portal/seo', label: 'SEO', icon: Search },
      { id: '/portal/socials', label: 'Socials', icon: Calendar },
      { id: '/portal/ads', label: 'Ads', icon: Megaphone },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { id: '/portal/services', label: 'Services', icon: Package },
      { id: '/portal/documents', label: 'Documents', icon: FolderOpen },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: '/portal/connections', label: 'Connections', icon: Link2 },
      { id: '/portal/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ userName, orgName, badge }: { userName: string; orgName: string; badge?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r border-ink-line bg-ink-surface h-screen sticky top-0">
      {/* Logo */}
      <div className="h-[72px] flex items-center gap-3 px-5 flex-shrink-0">
        <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xs">LF</span>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold tracking-tight truncate">LegacyForward</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">{orgName}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-4 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <div className="text-[11px] font-medium text-ink-subtle px-2 py-1.5 uppercase tracking-wider">{group.label}</div>
            {group.items.map((item) => {
              const active = pathname === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.id}
                  className={clsx(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors',
                    active ? 'bg-brand text-white' : 'text-ink hover:bg-ink-line/50'
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                  {item.badge && (
                    <span className={clsx(
                      'ml-auto text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded',
                      item.badge === 'LIVE' ? 'bg-red-100 text-red-600' : 'bg-accent/20 text-ink'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User chip */}
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-ink-line bg-white">
          <span className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">
            {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">{userName}</div>
            <div className="text-[11px] text-ink-muted truncate">Member</div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-ink-subtle hover:text-red-600 transition-colors">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
