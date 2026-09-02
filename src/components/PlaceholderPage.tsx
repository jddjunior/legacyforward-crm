import PageHeader from '@/components/PageHeader';
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} desc={description} pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
        <div className="px-5 py-20 text-center">
          <span className="inline-flex w-14 h-14 rounded-full bg-[#f7f6f2] items-center justify-center mb-4">
            <Construction size={28} strokeWidth={1.5} className="text-[#918da0]" />
          </span>
          <h2 className="text-[17px] font-semibold tracking-[-0.015em] mb-2">Coming Soon</h2>
          <p className="text-[13px] text-[#6b6b74] max-w-md mx-auto">
            This module is part of the roadmap. The data model and API integration for this feature are defined in BACKEND.md and ready to be built.
          </p>
        </div>
      </div>
    </>
  );
}
