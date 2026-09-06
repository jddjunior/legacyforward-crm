'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';

// Wiki ingestion for the brand documents page. Real file extraction
// (PDF/DOCX/OCR) runs out-of-band; this is the manual path.
export async function createDocument(formData: FormData) {
  const session = await requireSession();
  const db = forSession(session);
  if (!session.orgId) throw new Error('No org');

  const title = String(formData.get('title') || '').trim();
  if (!title) return;

  const content = String(formData.get('content') || '').trim();

  await db.document.create({
    data: {
      orgId: session.orgId,
      title,
      category: String(formData.get('category') || 'TXT'),
      content: content || null,
      size: content ? Math.max(1, Math.round(content.length / 1024)) + ' KB' : '—',
      status: 'indexed',
    },
  });
  revalidatePath('/portal/documents');
}
