'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function createProposal(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  const title = String(formData.get('title'));
  const clientOrgId = String(formData.get('clientOrgId')) || session.orgId;

  // Parse pages from the form
  const pageNames = formData.getAll('pageName') as string[];
  const pageHeadings = formData.getAll('pageHeading') as string[];
  const pageBodies = formData.getAll('pageBody') as string[];

  // Build pages structure
  // Each page can have multiple sections (heading/body pairs)
  // We group them: pageName is repeated for each section in that page
  const pages: { name: string; sections: { heading: string; body: string }[] }[] = [];
  let currentPage: { name: string; sections: { heading: string; body: string }[] } | null = null;

  for (let i = 0; i < pageHeadings.length; i++) {
    const pageName = pageNames[i];
    if (!currentPage || currentPage.name !== pageName) {
      currentPage = { name: pageName, sections: [] };
      pages.push(currentPage);
    }
    currentPage.sections.push({
      heading: pageHeadings[i],
      body: pageBodies[i],
    });
  }

  await prisma.proposal.create({
    data: {
      orgId: clientOrgId,
      title,
      status: 'sent',
      pages: pages.length > 0 ? pages : [{ name: 'Home', sections: [] }],
    },
  });

  revalidatePath('/agency/proposals');
}
