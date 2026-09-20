'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

function parsePages(formData: FormData) {
  const pageNames = formData.getAll('pageName') as string[];
  const pageHeadings = formData.getAll('pageHeading') as string[];
  const pageBodies = formData.getAll('pageBody') as string[];

  const pages: { name: string; sections: { heading: string; body: string }[] }[] = [];
  let currentPage: { name: string; sections: { heading: string; body: string }[] } | null = null;

  for (let i = 0; i < pageHeadings.length; i++) {
    const pageName = pageNames[i];
    if (!currentPage || currentPage.name !== pageName) {
      currentPage = { name: pageName, sections: [] };
      pages.push(currentPage);
    }
    currentPage.sections.push({ heading: pageHeadings[i], body: pageBodies[i] });
  }
  return pages;
}

function parsePriceCents(raw: FormDataEntryValue | null) {
  const value = Number(String(raw ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
}

export async function createProposal(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  const title = String(formData.get('title'));
  const clientOrgId = String(formData.get('clientOrgId')) || session.orgId;
  const liveUrl = String(formData.get('liveUrl') || '').trim() || null;
  const pages = parsePages(formData);

  const proposal = await prisma.proposal.create({
    data: {
      orgId: clientOrgId,
      title,
      status: 'sent',
      liveUrl,
      priceCents: parsePriceCents(formData.get('price')),
      pages: pages.length > 0 ? pages : [{ name: 'Home', sections: [] }],
    },
  });

  revalidatePath('/agency/proposals');
  redirect(`/agency/proposals/${proposal.id}`);
}

export async function updateProposal(proposalId: string, formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  const updated = await prisma.proposal.updateMany({
    where: { id: proposalId },
    data: {
      title: String(formData.get('title')),
      liveUrl: String(formData.get('liveUrl') || '').trim() || null,
      priceCents: parsePriceCents(formData.get('price')),
      status: String(formData.get('status') || 'sent'),
    },
  });

  if (updated.count === 0) {
    throw new Error('Proposal no longer exists');
  }

  revalidatePath(`/agency/proposals/${proposalId}`);
  revalidatePath('/agency/proposals');
}

export async function resolveChangeRequest(proposalId: string, changeRequestId: string) {
  await requireSession();
  await prisma.changeRequest.update({
    where: { id: changeRequestId },
    data: { status: 'resolved' },
  });
  revalidatePath(`/agency/proposals/${proposalId}`);
}
