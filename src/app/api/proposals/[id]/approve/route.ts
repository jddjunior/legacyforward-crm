import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const proposal = await prisma.proposal.findUnique({ where: { id: params.id } });
  if (!proposal) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  await prisma.proposal.update({
    where: { id: params.id },
    data: { status: 'approved' },
  });

  // Advance org onboarding
  await prisma.org.update({
    where: { id: proposal.orgId },
    data: { onboardingStage: 'proposal_approved' },
  });

  return Response.json({ ok: true });
}
