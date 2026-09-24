import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ArrowUp, ArrowDown, Minus, Search, Trophy, TrendingUp } from 'lucide-react';
import { createKeyword, updateKeywordRank, deleteKeyword } from '@/app/actions/keywords';
import { PageHeader, NewItemPanel, Field, Empty, StatCard, ActionButton } from '@/components/ui';

function Movement({ now, before }: { now: number | null; before: number | null }) {
  if (now == null || before == null || now === before) return <Minus size={14} className="text-ink-subtle" />;
  const up = now < before; // lower rank number is better
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
      <Icon size={14} />{Math.abs(before - now)}
    </span>
  );
}

export default async function SeoPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  const keywords = await prisma.keyword.findMany({
    where: { orgId: session.orgId },
    orderBy: [{ position: { sort: 'asc', nulls: 'last' } }, { term: 'asc' }],
  });

  const ranked = keywords.filter((k) => k.position != null);
  const top3 = ranked.filter((k) => k.position! <= 3).length;
  const improved = keywords.filter((k) => k.position != null && k.previousPosition != null && k.position < k.previousPosition).length;
  const avg = ranked.length ? (ranked.reduce((s, k) => s + k.position!, 0) / ranked.length).toFixed(1) : '—';

  return (
    <div className="p-8">
      <PageHeader title="SEO" subtitle="Keyword rankings on Google — record each rank check to track movement." />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Tracked keywords" value={String(keywords.length)} icon={Search} />
        <StatCard label="Average position" value={String(avg)} icon={TrendingUp} />
        <StatCard label="Top 3 rankings" value={String(top3)} icon={Trophy} />
        <StatCard label="Improved" value={String(improved)} icon={ArrowUp} hint="since last check" />
      </div>

      <NewItemPanel label="Track Keyword">
        <form action={createKeyword} className="grid grid-cols-5 gap-3">
          <Field label="Keyword *" className="col-span-2"><input name="term" required className="input" placeholder="roof repair near me" /></Field>
          <Field label="Target page"><input name="targetUrl" className="input" placeholder="/services/roof-repair" /></Field>
          <Field label="Monthly volume"><input name="volume" type="number" min="0" className="input" placeholder="1200" /></Field>
          <Field label="Current rank"><input name="position" type="number" min="1" className="input" placeholder="—" /></Field>
          <div className="col-span-5 flex justify-end"><button type="submit" className="btn btn-primary">Track Keyword</button></div>
        </form>
      </NewItemPanel>

      {keywords.length === 0 ? (
        <Empty>No keywords tracked yet.</Empty>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left">
                <th className="px-5 py-3 label">Keyword</th>
                <th className="px-5 py-3 label">Rank</th>
                <th className="px-5 py-3 label">Change</th>
                <th className="px-5 py-3 label">Volume</th>
                <th className="px-5 py-3 label">New rank check</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {keywords.map((k) => (
                <tr key={k.id} className="hover:bg-ink-surface">
                  <td className="px-5 py-3">
                    <div className="font-medium">{k.term}</div>
                    {k.targetUrl && <div className="text-xs text-ink-muted">{k.targetUrl}</div>}
                  </td>
                  <td className="px-5 py-3 font-semibold">{k.position ?? <span className="text-ink-subtle font-normal">Not ranking</span>}</td>
                  <td className="px-5 py-3"><Movement now={k.position} before={k.previousPosition} /></td>
                  <td className="px-5 py-3 text-ink-muted">{k.volume?.toLocaleString() ?? '—'}</td>
                  <td className="px-5 py-3">
                    <form action={updateKeywordRank.bind(null, k.id)} className="flex gap-2">
                      <input name="position" type="number" min="1" placeholder="rank" className="input w-20 h-8" />
                      <button type="submit" className="btn text-xs h-8 px-3">Save</button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-right"><ActionButton action={deleteKeyword.bind(null, k.id)} tone="danger">Remove</ActionButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
