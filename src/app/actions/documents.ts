'use server';

import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireOrg } from '@/lib/auth';
import { str } from '@/lib/form';
import { MAX_UPLOAD_BYTES, storagePathFor } from '@/lib/storage';

const PATH = '/portal/documents';

export async function uploadDocument(formData: FormData) {
  const { orgId } = await requireOrg();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) throw new Error('Choose a file to upload');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('File is larger than 10 MB');

  const ext = path.extname(file.name).slice(0, 10);
  const relative = path.join(orgId, `${randomUUID()}${ext}`);
  const full = storagePathFor(relative);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(await file.arrayBuffer()));

  await prisma.document.create({
    data: {
      orgId,
      name: str(formData, 'name') || file.name,
      category: str(formData, 'category') || 'general',
      storagePath: relative,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    },
  });
  revalidatePath(PATH);
}

export async function deleteDocument(id: string) {
  const { orgId } = await requireOrg();
  const doc = await prisma.document.findFirst({ where: { id, orgId } });
  if (!doc) return;
  await prisma.document.delete({ where: { id } });
  await unlink(storagePathFor(doc.storagePath)).catch(() => {});
  revalidatePath(PATH);
}
