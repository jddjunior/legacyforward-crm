'use client';

import { ShieldCheck, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PageHeader({
  title,
  desc,
  pendingCount = 0,
  children,
}: {
  title: string;
  desc?: string;
  pendingCount?: number;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex-shrink-0 flex items-center gap-3 px-7 pt-6 pb-[18px] sticky top-0 bg-[#f6f5f1]/93 backdrop-blur z-30">
      <span className="min-w-0">
        <span className="block text-[34px] font-semibold tracking-[-0.038em] leading-[1.1] text-[#14141a]">{title}</span>
        {desc && <span className="block mt-1.5 text-[14px] text-[#6b6b74]">{desc}</span>}
      </span>
      <div className="flex-1" />
      <span className="inline-flex items-center gap-2 h-[42px] px-[15px] rounded-full border border-[#e6e2d8] bg-white text-[13px] font-medium text-[#4a4a52]">
        This month
      </span>
      <button className="btn h-[42px] px-[18px]">Invite</button>
      <Link
        href="/portal/approvals"
        aria-label="Approvals"
        className="relative w-[42px] h-[42px] rounded-full border border-[#e6e2d8] bg-white flex items-center justify-center hover:border-[#146c43] transition-colors"
      >
        <ShieldCheck size={18} strokeWidth={1.7} className="text-[#14141a]" />
        {pendingCount > 0 && (
          <span className="absolute -top-[3px] -right-[3px] min-w-[19px] h-[19px] rounded-full bg-[#cf1c0c] text-white mono text-[10.5px] font-semibold flex items-center justify-center px-[5px] border-2 border-[#f6f5f1]">
            {pendingCount}
          </span>
        )}
      </Link>
      <button
        aria-label="Quick actions"
        className="w-[46px] h-[46px] rounded-full bg-[#14141a] text-white flex items-center justify-center hover:bg-[#146c43] transition-colors"
      >
        <Plus size={19} strokeWidth={2} />
      </button>
      {children}
    </header>
  );
}
