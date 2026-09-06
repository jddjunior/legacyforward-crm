import { prisma } from '@/lib/db';
import type { SessionPayload } from '@/lib/session';

/**
 * Append-only audit trail (Build Plan §1.6).
 *
 * Covers price/margin changes, budget edits, impersonation, approvals,
 * connection changes, invitations and deletions. The table rejects UPDATE and
 * DELETE at the database level, so anything written here is permanent.
 *
 * Uses the admin client deliberately: an audit entry must be recorded even
 * when the acting session is an agency admin operating on another tenant, and
 * the write must not be suppressible by the tenant it describes.
 */
export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'approved'
  | 'rejected'
  | 'price_changed'
  | 'budget_changed'
  | 'impersonated'
  | 'invited'
  | 'connection_changed'
  | 'stage_advanced';

export async function writeAudit(
  session: SessionPayload,
  params: {
    action: AuditAction;
    entity: string;
    entityId?: string;
    orgId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const orgId = params.orgId ?? session.orgId;
  if (!orgId) return;

  await prisma.auditLog.create({
    data: {
      orgId,
      userId: session.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: {
        ...(params.metadata ?? {}),
        actorEmail: session.email,
        actorRole: session.orgRole ?? 'unknown',
        // True whenever an agency session acted on a client's tenant.
        crossTenant: session.orgId !== orgId || session.orgRole === 'agency_admin',
      },
    },
  });
}
