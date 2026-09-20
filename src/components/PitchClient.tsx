'use client';

import { useEffect, useRef, useState } from 'react';

const viewports = [
  { id: 'desktop', width: '100%', label: 'Desktop' },
  { id: 'tablet', width: '768px', label: 'Tablet' },
  { id: 'mobile', width: '375px', label: 'Mobile' },
];

const HERO_IMAGE = 'https://media.base44.com/images/public/6a97f1747b6fbb1f9a2143e5/566cd4a9e_generated_102df09c.jpg';
const SECTION_IMAGES = [
  'https://media.base44.com/images/public/6a97f1747b6fbb1f9a2143e5/a94070613_generated_879c3cf6.jpg',
  'https://media.base44.com/images/public/6a97f1747b6fbb1f9a2143e5/3ec7e2579_generated_42f77b93.jpg',
];

interface ProposalPage {
  name: string;
  sections: { heading: string; body: string }[];
}

/** Live URL for a given proposal page: Home is the root, others become a slug path. */
function pageUrl(liveUrl: string, pageName: string, index: number) {
  if (index === 0 || /^home$/i.test(pageName)) return liveUrl;
  const slug = pageName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${liveUrl.replace(/\/$/, '')}/${slug}`;
}

export default function PitchClient({
  proposalId,
  pages,
  title,
  stripeEnabled,
  liveUrl,
  priceCents,
  status,
}: {
  proposalId: string;
  pages: ProposalPage[];
  title: string;
  stripeEnabled: boolean;
  liveUrl: string | null;
  priceCents: number | null;
  status: string;
}) {
  const [viewport, setViewport] = useState('desktop');
  const [activePage, setActivePage] = useState(0);
  const [showChanges, setShowChanges] = useState(false);
  const [changeRequests, setChangeRequests] = useState<{ page: string; request: string; status: string }[]>([]);
  const [newChange, setNewChange] = useState('');
  const [approved, setApproved] = useState(status === 'approved');
  const [paying, setPaying] = useState(false);
  // Some sites refuse to be framed (X-Frame-Options / CSP). The iframe then never fires
  // load, so treat a silent frame as blocked and show the proposal content instead.
  const [frameBlocked, setFrameBlocked] = useState(false);
  const frameLoaded = useRef(false);

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

  const vp = viewports.find((v) => v.id === viewport)!;
  const currentPage = pages[activePage];
  const currentUrl = liveUrl ? pageUrl(liveUrl, currentPage?.name || '', activePage) : null;

  useEffect(() => {
    if (!currentUrl) return;
    frameLoaded.current = false;
    setFrameBlocked(false);
    const timer = setTimeout(() => {
      if (!frameLoaded.current) setFrameBlocked(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentUrl]);

  const price =
    priceCents != null
      ? `$${(priceCents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : null;

  return (
    <div className="room">
      <header className="top">
        <div className="mark">BA</div>
        <div className="title">{title}</div>
        <div className="status">{approved ? 'Approved' : status}</div>
        <div className="topspace" />
        <div className="topnote">{vp.label}</div>
      </header>

      <main className="workspace">
        <aside className="rail">
          <div className="railtitle">Pages</div>
          <div className="thumbs">
            {pages.map((p, i) => (
              <button
                key={i}
                className={`thumb${activePage === i ? ' active' : ''}`}
                onClick={() => setActivePage(i)}
              >
                <span />
                <b>{p.name || `Page ${i + 1}`}</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="device-wrap">
          <div className="browser" style={{ width: vp.width }}>
            <div className="chrome">
              <div className="dots">
                <i />
                <i />
                <i />
              </div>
              <div className="address">{currentUrl || 'No live URL yet'}</div>
            </div>

            <div className="viewportbar">
              {viewports.map((v) => (
                <button
                  key={v.id}
                  className={viewport === v.id ? 'selected' : undefined}
                  onClick={() => setViewport(v.id)}
                >
                  {v.label}
                </button>
              ))}
              <div className="tabs">
                {pages.map((p, i) => (
                  <button
                    key={i}
                    className={`tab${activePage === i ? ' selected' : ''}`}
                    onClick={() => setActivePage(i)}
                  >
                    {p.name || `Page ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="site">
              {currentUrl && !frameBlocked ? (
                <iframe
                  key={currentUrl}
                  className="live-frame"
                  src={currentUrl}
                  title={`${currentPage?.name || 'Page'} — live preview`}
                  onLoad={() => {
                    frameLoaded.current = true;
                  }}
                />
              ) : currentUrl && frameBlocked ? (
                <div className="empty">
                  <p>This site can&apos;t be displayed inside the review room.</p>
                  <p>{currentUrl.replace(/^https?:\/\//, '')} blocks embedding.</p>
                </div>
              ) : (
                <>
                  <div className="hero">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={HERO_IMAGE} alt="" />
                    <div className="hero-content">
                      <h1>{title}</h1>
                      <p>{currentPage?.name || 'Home'} — live build preview pending.</p>
                    </div>
                  </div>
                  {currentPage?.sections?.map((section, i) => (
                    <div key={i} className="site-section">
                      <div>
                        <h2>{section.heading}</h2>
                        <p>{section.body}</p>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="section-image" src={SECTION_IMAGES[i % SECTION_IMAGES.length]} alt="" />
                    </div>
                  ))}
                  {(!currentPage?.sections || currentPage.sections.length === 0) && (
                    <div className="empty">
                      <p>This page is ready for your review.</p>
                      <p>Approve above or request changes.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <aside className="side">
          <div className="scope-label">Proposal</div>
          <h2>{title}</h2>
          <div className="summary">
            <div>
              <span>Pages</span>
              <strong>{pages.map((p, i) => p.name || `Page ${i + 1}`).join(', ')}</strong>
            </div>
            <div>
              <span>Status</span>
              {approved ? <span className="badge approved">Approved</span> : <strong>{status}</strong>}
            </div>
            {currentUrl && (
              <div>
                <span>Live URL</span>
                <strong>{currentUrl.replace(/^https?:\/\//, '')}</strong>
              </div>
            )}
          </div>
          {price && (
            <div className="price">
              <small>Project total</small>
              <b>{price}</b>
            </div>
          )}
          <div className="side-actions">
            <button className="request" onClick={() => setShowChanges(!showChanges)}>
              Request Changes
            </button>
            {!approved ? (
              <button className="approve" onClick={approve}>
                Approve
              </button>
            ) : stripeEnabled ? (
              <button className="pay" onClick={pay} disabled={paying}>
                {paying ? 'Redirecting…' : 'Pay & Continue'}
              </button>
            ) : (
              <div className="topnote">Add Stripe key to enable payment</div>
            )}
          </div>
        </aside>

        {showChanges && (
          <section className="changes">
            <h3>Request changes for &quot;{currentPage?.name}&quot;</h3>
            <div className="change-row">
              <input
                value={newChange}
                onChange={(e) => setNewChange(e.target.value)}
                placeholder="Describe what needs to change…"
              />
              <button className="submit" onClick={submitChange}>
                Submit
              </button>
            </div>
            {changeRequests.length > 0 && (
              <div className="requests">
                {changeRequests.map((cr, i) => (
                  <div key={i} className="request-item">
                    <code>{cr.page}:</code>
                    <span>{cr.request}</span>
                    <span className="badge pending">{cr.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="bottom-note">
          {changeRequests.length > 0
            ? `${changeRequests.length} change requests pending`
            : 'This page is ready for your review.'}
        </div>
      </main>
    </div>
  );
}
