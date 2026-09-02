import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { Photos, Videos, FileText, Image as ImageIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default async function MediaPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const docs = await prisma.document.findMany({ where: { orgId: session.orgId } });

  const buckets = [
    { group: 'photos', name: 'Job Photos', icon: ImageIcon, count: 0, tags: ['geotagged'] },
    { group: 'photos', name: 'Before & After', icon: ImageIcon, count: 0, tags: ['paired', 'ad-ready'] },
    { group: 'photos', name: 'Crew', icon: ImageIcon, count: 0, tags: ['people', 'trust'] },
    { group: 'photos', name: 'Equipment & Trucks', icon: ImageIcon, count: 0, tags: ['brand'] },
    { group: 'videos', name: 'Job Walkthroughs', icon: Videos, count: 0, tags: ['long form'] },
    { group: 'docs', name: 'Brand Assets', icon: FileText, count: docs.length, tags: ['logo', 'colors'] },
  ];

  return (
    <>
      <PageHeader title="Media" desc="Labeled buckets for organized agent retrieval" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5">
          {buckets.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.name} className="border border-[#eeece6] rounded-[13px] p-5 hover:border-[#146c43] transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-[#e8f3ec] flex items-center justify-center">
                    <Icon size={20} strokeWidth={1.8} className="text-[#146c43]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate">{b.name}</div>
                    <div className="mono text-[11px] text-[#5c5a52] uppercase tracking-wider mt-0.5">{b.group}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mono text-[13px] font-semibold text-[#14141a]">{b.count}</span>
                  <span className="text-[12px] text-[#6b6b74]">items</span>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {b.tags.map(t => (
                    <span key={t} className="text-[10px] font-medium bg-[#f7f6f2] text-[#5c5a52] rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
