import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { FileText, Download } from 'lucide-react';
import { uploadDocument, deleteDocument } from '@/app/actions/documents';
import { PageHeader, NewItemPanel, Field, Empty, ActionButton } from '@/components/ui';
import { fileSize, shortDate } from '@/lib/format';

const CATEGORIES = ['contract', 'invoice', 'brand', 'report', 'general'];

export default async function DocumentsPage({ searchParams }: { searchParams: { category?: string } }) {
  const session = await getSession();
  if (!session?.orgId) return null;

  const category = CATEGORIES.includes(searchParams.category || '') ? searchParams.category : undefined;
  const docs = await prisma.document.findMany({
    where: { orgId: session.orgId, ...(category ? { category } : {}) },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <PageHeader title="Documents" subtitle="Contracts, invoices, brand files and reports shared with your team." />

      <NewItemPanel label="Upload Document">
        <form action={uploadDocument} className="grid grid-cols-4 gap-3">
          <Field label="File * (max 10 MB)" className="col-span-2">
            <input name="file" type="file" required className="input py-1.5" />
          </Field>
          <Field label="Display name"><input name="name" className="input" placeholder="Defaults to file name" /></Field>
          <Field label="Category">
            <select name="category" className="input capitalize">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="col-span-4 flex justify-end"><button type="submit" className="btn btn-primary">Upload</button></div>
        </form>
      </NewItemPanel>

      <div className="flex gap-2 mb-4">
        <a href="/portal/documents" className={`badge ${!category ? 'badge-blue' : 'badge-gray'}`}>All</a>
        {CATEGORIES.map((c) => (
          <a key={c} href={`/portal/documents?category=${c}`} className={`badge capitalize ${category === c ? 'badge-blue' : 'badge-gray'}`}>{c}</a>
        ))}
      </div>

      {docs.length === 0 ? (
        <Empty>No documents{category ? ` in ${category}` : ''} yet.</Empty>
      ) : (
        <div className="card divide-y divide-ink-line">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <a href={`/api/documents/${d.id}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-brand truncate block">{d.name}</a>
                <div className="text-xs text-ink-muted">{fileSize(d.sizeBytes)} · {shortDate(d.createdAt)}</div>
              </div>
              <span className="badge badge-gray capitalize">{d.category}</span>
              <a href={`/api/documents/${d.id}?download`} className="text-ink-muted hover:text-brand" title="Download"><Download size={16} /></a>
              <ActionButton action={deleteDocument.bind(null, d.id)} tone="danger">Delete</ActionButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
