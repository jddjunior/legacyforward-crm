import Link from 'next/link';

export default function Panel({
  title,
  action,
  children,
}: {
  title?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-[#e9e6de] rounded-[13px] overflow-hidden">
      {title && (
        <div className="h-[52px] flex items-center gap-2.5 px-5 border-b border-[#efede7]">
          <span className="text-[17px] font-semibold tracking-[-0.015em]">{title}</span>
          {action && (
            <Link href={action.href} className="ml-auto text-[12.5px] font-medium text-[#146c43] hover:text-[#0f5132]">
              {action.label}
            </Link>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-14 text-center text-[13px] text-[#6b6b74]">{children}</div>;
}
