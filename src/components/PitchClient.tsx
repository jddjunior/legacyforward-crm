'use client';

import { useState } from 'react';
import GateHeader from '@/components/pitch/GateHeader';
import PreviewStage, { type ChangeRequest } from '@/components/pitch/PreviewStage';
import PaymentStage from '@/components/pitch/PaymentStage';
import AccessStage from '@/components/pitch/AccessStage';
import SetupStage, { type GatewayReview } from '@/components/pitch/SetupStage';
import { type GateStage, type ProposalPageDef } from '@/components/pitch/gateData';

// The pitch gateway: a four-stage overlay (website review → payment →
// access → onboarding) wrapped in the handed-over gateway shell.
export default function PitchClient({
  proposalId,
  orgName,
  stagedLabel,
  pages,
  stripeEnabled,
  reviews,
}: {
  proposalId: string;
  orgName: string;
  stagedLabel: string;
  pages: ProposalPageDef[];
  stripeEnabled: boolean;
  reviews: GatewayReview[];
}) {
  const [stage, setStage] = useState<GateStage>('preview');
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [paying, setPaying] = useState(false);

  function approve() {
    setStage('payment');
    // Record the approval in the CRM; the gateway moves on immediately.
    fetch(`/api/proposals/${proposalId}/approve`, { method: 'POST' }).catch(() => {});
  }

  async function pay() {
    if (!stripeEnabled) {
      setStage('access');
      return;
    }
    setPaying(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // fall through
    }
    setPaying(false);
  }

  function enterPortal() {
    window.open('/api/auth/login', '_blank');
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(23,23,26,0.42)]" style={{ padding: '2.5vh 2vw' }}>
      <div className="w-full h-full md:w-[80vw] md:max-w-[1480px] md:h-[86vh] bg-white border border-[#c6c6ce] rounded-[13px] shadow-[0_40px_90px_rgba(23,23,26,0.32)] flex flex-col overflow-hidden">
        <GateHeader stage={stage} stagedLabel={stagedLabel} />
        {stage === 'preview' && (
          <PreviewStage
            orgName={orgName}
            pages={pages}
            changes={changes}
            onAddChange={(rec) => setChanges([...changes, rec])}
            onRemoveChange={(id) => setChanges(changes.filter((c) => c.id !== id))}
            onApprove={approve}
          />
        )}
        {stage === 'payment' && (
          <PaymentStage changeCount={changes.length} paying={paying} onPay={pay} onBack={() => setStage('preview')} />
        )}
        {stage === 'access' && <AccessStage onCreated={() => setStage('setup')} />}
        {stage === 'setup' && <SetupStage reviews={reviews} onEnter={enterPortal} />}
      </div>
    </div>
  );
}
