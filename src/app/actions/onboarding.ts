'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function saveKickoff(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  await prisma.org.update({
    where: { id: session.orgId },
    data: {
      contactName: String(formData.get('contactName') || '').trim() || null,
      contactPhone: String(formData.get('contactPhone') || '').trim() || null,
      website: String(formData.get('website') || '').trim() || null,
      goals: String(formData.get('goals') || '').trim() || null,
      onboardingStage: 'kickoff_complete',
    },
  });
  revalidatePath('/portal/onboarding');
  revalidatePath('/portal');
}

export async function saveBrand(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  const brandColor = String(formData.get('brandColor')) || '#335aea';
  const logoUrl = String(formData.get('logoUrl')) || null;
  const name = String(formData.get('name')) || undefined;

  await prisma.org.update({
    where: { id: session.orgId },
    data: { brandColor, logoUrl, name, onboardingStage: 'brand_uploaded' },
  });
  revalidatePath('/portal/onboarding');
  revalidatePath('/portal');
}

export async function linkConnections(formData: FormData) {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  const providers = formData.getAll('providers');
  for (const provider of providers) {
    await prisma.connection.upsert({
      where: { orgId_provider: { orgId: session.orgId, provider: String(provider) } },
      update: { status: 'connected' },
      create: { orgId: session.orgId, provider: String(provider), status: 'connected' },
    });
  }

  await prisma.org.update({
    where: { id: session.orgId },
    data: { onboardingStage: 'connections_linked' },
  });
  revalidatePath('/portal/onboarding');
  revalidatePath('/portal');
}

export async function completeOnboarding() {
  const session = await requireSession();
  if (!session.orgId) throw new Error('No org');

  await prisma.org.update({
    where: { id: session.orgId },
    data: { onboardingStage: 'active' },
  });
  revalidatePath('/portal/onboarding');
  revalidatePath('/portal');
}
