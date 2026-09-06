import { prisma } from '@/lib/db';

/**
 * Idempotency for webhooks and publish actions (Build Plan §1.9).
 *
 * Providers retry deliveries; without this a retried `invoice.paid` charges
 * twice in the ledger and a retried publish double-posts. The unique index on
 * (source, eventId) is the actual guard — the insert is attempted BEFORE the
 * handler runs, so two concurrent deliveries cannot both pass the check.
 */
export type IdempotentResult<T> =
  | { status: 'processed'; result: T }
  | { status: 'duplicate' };

export async function withIdempotency<T>(
  key: { source: string; eventId: string; eventType?: string },
  handler: () => Promise<T>,
): Promise<IdempotentResult<T>> {
  try {
    await prisma.processedEvent.create({
      data: { source: key.source, eventId: key.eventId, eventType: key.eventType },
    });
  } catch (err: unknown) {
    // P2002 = unique constraint violation: this event was already claimed.
    if (typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002') {
      return { status: 'duplicate' };
    }
    throw err;
  }

  try {
    return { status: 'processed', result: await handler() };
  } catch (err) {
    // Release the claim so the provider's next retry can genuinely reprocess.
    await prisma.processedEvent
      .deleteMany({ where: { source: key.source, eventId: key.eventId } })
      .catch(() => undefined);
    throw err;
  }
}
