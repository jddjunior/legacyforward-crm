import { EmptyState } from './Panel';

export type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export default function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty = 'Nothing here yet.',
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}) {
  if (rows.length === 0) return <EmptyState>{empty}</EmptyState>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#efede7] text-left">
          {columns.map((c) => (
            <th key={c.header} className="px-5 py-3 label">{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#efede7]">
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-[#f7f6f2] transition-colors">
            {columns.map((c) => (
              <td key={c.header} className={`px-5 py-3 ${c.className ?? 'text-[#5f5f66]'}`}>{c.cell(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
