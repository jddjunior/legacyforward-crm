import { getSession } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

export default async function MediaPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <>
      <PageHeader title="Media" desc="Labeled buckets for organized agent retrieval" pendingCount={0} />
      <div className="m-0 mx-[26px] mb-[26px] bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
        <div className="px-5 py-16 text-center">
          <div className="w-12 h-12 rounded-[13px] bg-[#e8f3ec] flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#146c43" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }} aria-hidden="true">
              <path d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5zM4.5 9.5h15M9 5V3.5M15 5V3.5" />
            </svg>
          </div>
          <div className="text-[15px] font-semibold text-[#14141a] mb-1">No media uploaded yet</div>
          <div className="text-[13px] text-[#6b6b74] max-w-md mx-auto leading-relaxed">
            Photos and videos uploaded during onboarding are sorted into labeled buckets here, and the agent retrieves from them for every ad, post, and page it builds.
          </div>
        </div>
      </div>
    </>
  );
}
