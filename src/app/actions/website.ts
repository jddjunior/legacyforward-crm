'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

// A page-level change request from the Website page lands on the
// org's latest proposal as a pending ChangeRequest for the agency.
export async function requestPageChange(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) return;

  const pageId = String(formData.get('pageId') || '');
  const page = await prisma.websitePage.findFirst({
    where: { id: pageId, orgId: session.orgId },
  });
  if (!page) return;

  const proposal = await prisma.proposal.findFirst({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
  });
  if (!proposal) return;

  await prisma.changeRequest.create({
    data: {
      proposalId: proposal.id,
      page: page.title,
      elementRef: page.path,
      request: String(formData.get('request') || '').trim() || `Change requested on ${page.title}`,
      status: 'pending',
    },
  });
  revalidatePath('/portal/website');
}
