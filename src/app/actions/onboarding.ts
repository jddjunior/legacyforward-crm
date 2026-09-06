'use server';

import { revalidatePath } from 'next/cache';
import { forSession } from '@/lib/rls';
import { requireSession } from '@/lib/auth';
import { writeAudit } from '@/lib/audit';

const STAGES = [
  'payment_complete',
  'brand_uploaded',
  'connections_linked',
  'reviews_approved',
  'active',
];

export async function saveBrand(formData: FormData) {
  const session = await requireSession();
  const db = forSession(session);
  if (!session.orgId) throw new Error('No org');

  const brandColor = String(formData.get('brandColor')) || '#335aea';
  const logoUrl = String(formData.get('logoUrl')) || null;
  const name = String(formData.get('name')) || undefined;

  await db.org.update({
    where: { id: session.orgId },
    data: { brandColor, logoUrl, name, onboardingStage: 'brand_uploaded' },
  });
  await writeAudit(session, {
    action: 'stage_advanced', entity: 'Org', entityId: session.orgId,
    metadata: { stage: 'brand_uploaded' },
  });
  revalidatePath('/portal/onboarding');
  revalidatePath('/portal');
}

export async function linkConnections(formData: FormData) {
  const session = await requireSession();
  const db = forSession(session);
  if (!session.orgId) throw new Error('No org');

  const providers = formData.getAll('providers');
  for (const provider of providers) {
    const existing = await db.connection.findFirst({
      where: { orgId: session.orgId, provider: String(provider) },
    });
    if (existing) {
      await db.connection.update({ where: { id: existing.id }, data: { status: 'connected' } });
    } else {
      await db.connection.create({
        data: { orgId: session.orgId, provider: String(provider), status: 'connected' },
      });
    }
  }

  await db.org.update({
    where: { id: session.orgId },
    data: { onboardingStage: 'connections_linked' },
  });
  await writeAudit(session, {
    action: 'connection_changed', entity: 'Connection',
    metadata: { providers: providers.map(String), stage: 'connections_linked' },
  });
  revalidatePath('/portal/onboarding');
  revalidatePath('/portal');
}

export async function completeOnboarding() {
  const session = await requireSession();
  const db = forSession(session);
  if (!session.orgId) throw new Error('No org');

  await db.org.update({
    where: { id: session.orgId },
    data: { onboardingStage: 'active' },
  });
  await writeAudit(session, {
    action: 'stage_advanced', entity: 'Org', entityId: session.orgId,
    metadata: { stage: 'active' },
  });
  revalidatePath('/portal/onboarding');
  revalidatePath('/portal');
}
