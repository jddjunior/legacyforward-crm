'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, Building2, FileText, CheckSquare } from 'lucide-react';

const navItems = [
  { id: '/agency', label: 'Dashboard', icon: LayoutDashboard },
  { id: '/agency/clients', label: 'Clients', icon: Building2 },
  { id: '/agency/proposals', label: 'Proposals', icon: FileText },
  { id: '/agency/approvals', label: 'Approvals Queue', icon: CheckSquare },
];

export default function AgencySidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r border-ink-line bg-ink-surface h-screen sticky top-0">
      <div className="h-[72px] flex items-center gap-3 px-5">
        <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xs">LF</span>
        <div>
          <div className="text-[15px] font-semibold tracking-tight">LegacyForward</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">Agency Console</div>
        </div>
      </div>
      <nav className="flex-1 px-3 flex flex-col gap-0.5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.id;
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
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Link href="/portal" className="btn btn-ghost w-full justify-center text-xs">
          Switch to Client Portal
        </Link>
      </div>
    </aside>
  );
}
