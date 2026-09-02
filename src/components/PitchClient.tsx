'use client';

import { useState } from 'react';
import { Monitor, Tablet, Smartphone, Check, X } from 'lucide-react';

const viewports = [
  { id: 'desktop', icon: Monitor, width: '100%', label: 'Desktop' },
  { id: 'tablet', icon: Tablet, width: '768px', label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, width: '375px', label: 'Mobile' },
];

interface ProposalPage {
  name: string;
  sections: { heading: string; body: string }[];
}

export default function PitchClient({
  proposalId,
  pages,
  title,
  stripeEnabled,
}: {
  proposalId: string;
  pages: ProposalPage[];
  title: string;
  stripeEnabled: boolean;
}) {
  const [viewport, setViewport] = useState('desktop');
  const [activePage, setActivePage] = useState(0);
  const [showChanges, setShowChanges] = useState(false);
  const [changeRequests, setChangeRequests] = useState<{ page: string; request: string; status: string }[]>([]);
  const [newChange, setNewChange] = useState('');
  const [approved, setApproved] = useState(false);
  const [paying, setPaying] = useState(false);

  async function approve() {
    setApproved(true);
    await fetch(`/api/proposals/${proposalId}/approve`, { method: 'POST' });
  }

  async function pay() {
    setPaying(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setPaying(false);
    }
  }

  function submitChange() {
    if (!newChange.trim()) return;
    setChangeRequests([...changeRequests, { page: pages[activePage].name, request: newChange, status: 'pending' }]);
    setNewChange('');
  }

  const vp = viewports.find(v => v.id === viewport)!;
  const currentPage = pages[activePage];

  return (
    <div className="min-h-screen bg-ink-surface flex flex-col">
      {/* Toolbar */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-ink-line bg-white">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-[10px]">LF</span>
          <span className="text-sm font-semibold">{title}</span>
        </div>

        <div className="flex items-center gap-1 ml-4 bg-ink-surface rounded-lg p-1">
          {viewports.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setViewport(v.id)}
                className={`p-1.5 rounded-md transition-colors ${viewport === v.id ? 'bg-white shadow-sm text-brand' : 'text-ink-subtle'}`}
                title={v.label}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>

        <div className="flex gap-1.5 ml-2">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePage(i)}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${activePage === i ? 'bg-brand text-white' : 'text-ink-muted hover:bg-ink-surface'}`}
            >
              {pages[i].name || `Page ${i + 1}`}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {changeRequests.length > 0 && (
          <span className="badge badge-yellow">{changeRequests.length} changes</span>
        )}

        {!approved ? (
          <>
            <button onClick={() => setShowChanges(!showChanges)} className="btn text-sm h-9">
              Request Changes
            </button>
            <button onClick={approve} className="btn btn-primary text-sm h-9">
              <Check size={16} /> Approve
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="badge badge-green"><Check size={12} /> Approved</span>
            {stripeEnabled ? (
              <button onClick={pay} disabled={paying} className="btn btn-primary text-sm h-9">
                {paying ? 'Redirecting…' : 'Pay & Continue'}
              </button>
            ) : (
              <span className="text-xs text-ink-muted">Add Stripe key to enable payment</span>
            )}
          </div>
        )}
      </header>

      {/* Change request panel */}
      {showChanges && (
        <div className="border-b border-ink-line bg-white px-6 py-4">
          <div className="max-w-2xl">
            <h3 className="text-sm font-semibold mb-2">Request changes for "{currentPage?.name}"</h3>
            <div className="flex gap-2">
              <input
                value={newChange}
                onChange={(e) => setNewChange(e.target.value)}
                placeholder="Describe what needs to change…"
                className="input flex-1"
              />
              <button onClick={submitChange} className="btn btn-primary">Submit</button>
            </div>
            {changeRequests.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {changeRequests.map((cr, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-xs font-mono text-ink-subtle mt-0.5">{cr.page}:</span>
                    <span className="flex-1">{cr.request}</span>
                    <span className="badge badge-yellow text-[10px]">{cr.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-auto">
        <div
          className="bg-white rounded-xl shadow-sm border border-ink-line overflow-hidden transition-all"
          style={{ width: vp.width, maxWidth: '100%' }}
        >
          <div className="border-b border-ink-line px-5 py-3 flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="p-8">
            {currentPage?.sections?.map((section, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-3">{section.heading}</h2>
                <p className="text-ink-muted leading-relaxed">{section.body}</p>
              </div>
            ))}
            {(!currentPage?.sections || currentPage.sections.length === 0) && (
              <div className="text-center text-ink-muted py-20">
                <p className="text-sm">This page is ready for your review.</p>
                <p className="text-xs mt-2">Approve above or request changes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
