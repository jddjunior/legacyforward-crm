'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

const STAGES = [
  'payment_complete',
  'brand_uploaded',
  'connections_linked',
  'reviews_approved',
  'active',
];

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
    const existing = await prisma.connection.findFirst({
      where: { orgId: session.orgId, provider: String(provider) },
    });
    if (existing) {
      await prisma.connection.update({ where: { id: existing.id }, data: { status: 'connected' } });
    } else {
      await prisma.connection.create({
        data: { orgId: session.orgId, provider: String(provider), status: 'connected' },
      });
    }
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
