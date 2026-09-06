'use client';

import { useState, useTransition } from 'react';
import { approveReview, publishReview } from '@/app/actions/reviews';

export interface ReviewRow {
  id: string;
  source: string;
  author: string;
  rating: number;
  content: string | null;
  status: string; // pending, approved, published
}

const STATUS_STYLE: Record<string, { bg: string; ink: string; label: string }> = {
  pending: { bg: '#fff3d1', ink: '#8a5a00', label: 'Needs review' },
  approved: { bg: '#e7f2ea', ink: '#1f6b18', label: 'Approved' },
  published: { bg: '#e8f3ec', ink: '#146c43', label: 'On your site' },
};

// Reviews — approve clears a review, publish is what feeds the
// site widget. The agency pulls nightly; the customer decides.
export default function ReviewsView({ reviews }: { reviews: ReviewRow[] }) {
  const [items, setItems] = useState(reviews);
  const [, startTransition] = useTransition();

  function onApprove(id: string) {
    setItems(xs => xs.map(x => (x.id === id ? { ...x, status: 'approved' } : x)));
    startTransition(() => { approveReview(id); });
  }

  function onPublish(id: string) {
    setItems(xs => xs.map(x => (x.id === id ? { ...x, status: 'published' } : x)));
    startTransition(() => { publishReview(id); });
  }

  if (items.length === 0) {
    return <div style={{ padding: '26px 20px', fontSize: 13, color: '#5f5f66' }}>No reviews pulled yet — nightly pulls land here for your read.</div>;
  }

  return (
    <div>
      {items.map(r => {
        const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 20px', borderBottom: '1px solid #efede7', flexWrap: 'wrap' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: r.status === 'published' ? '#146c43' : r.status === 'approved' ? '#1f6b18' : '#ffc400', flex: '0 0 5px', marginTop: 8 }} aria-hidden="true" />
            <span style={{ minWidth: 190, flex: '0 0 auto' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.author}</span>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: '#45454d', border: '1px solid #e9e6de', borderRadius: 4, padding: '1px 4px', textTransform: 'uppercase' }}>{r.source}</span>
              </span>
              <span style={{ display: 'block', marginTop: 3, fontSize: 12.5, color: '#8a5a00' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </span>
            <span style={{ flex: 1, minWidth: 220, fontSize: 13, lineHeight: 1.5, color: '#2b2b33' }}>{r.content || '—'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flex: '0 0 auto' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: st.ink, background: st.bg, borderRadius: 999, padding: '2px 9px' }}>{st.label}</span>
              {r.status === 'pending' && (
                <button type="button" onClick={() => onApprove(r.id)} style={{ height: 30, padding: '0 13px', borderRadius: 11, border: 'none', background: '#146c43', color: '#ffffff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
              )}
              {r.status === 'approved' && (
                <button type="button" onClick={() => onPublish(r.id)} style={{ height: 30, padding: '0 13px', borderRadius: 11, border: 'none', background: '#14141a', color: '#ffffff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Publish</button>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
