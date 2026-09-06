import type { LucideIcon } from 'lucide-react';

export type Stat = { label: string; value: string; icon: LucideIcon };

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="px-[26px] grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))' }}>
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white border border-[#eeece6] rounded-[13px] p-5">
            <div className="flex items-center gap-[11px] mb-4">
              <span className="w-[38px] h-[38px] rounded-full bg-[#e8f3ec] flex items-center justify-center">
                <Icon size={19} strokeWidth={1.8} className="text-[#146c43]" />
              </span>
              <span className="mono text-[11px] font-medium tracking-[0.13em] uppercase text-[#5c5a52]">{s.label}</span>
            </div>
            <div className="text-[38px] font-semibold tracking-[-0.045em] leading-1 text-[#14141a]">{s.value}</div>
          </div>
        );
      })}
    </div>
  );
}
