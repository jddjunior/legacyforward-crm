import { readFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { storagePathFor } from '@/lib/storage';

/** Streams a document to members of the org that owns it. */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await prisma.document.findFirst({ where: { id: params.id, orgId: session.orgId } });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const data = await readFile(storagePathFor(doc.storagePath));
    // Only render safe types inline; anything else (HTML, SVG, scripts) is forced to download.
    const safeInline = /^(image\/(png|jpe?g|gif|webp)|application\/pdf)$/.test(doc.mimeType);
    const inline = safeInline && !request.nextUrl.searchParams.has('download');
    return new NextResponse(data, {
      headers: {
        'Content-Type': safeInline ? doc.mimeType : 'application/octet-stream',
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File missing from storage' }, { status: 410 });
  }
}
