'use client';

import { useState, useTransition } from 'react';
import { moveDeal } from '@/app/actions/deals';
import { STAGES, money } from '@/lib/design/data';

export interface BoardDeal {
  id: string;
  name: string;
  company: string;
  value: number;
  source: string;
  stage: string;
  age: number;
}

export default function PipelineView({ deals, boardValue }: { deals: BoardDeal[]; boardValue: string }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [localDeals, setLocalDeals] = useState(deals);
  const [, startTransition] = useTransition();

  const byStage = (id: string) => localDeals.filter(d => d.stage === id);
  const sum = (arr: BoardDeal[]) => arr.reduce((a, b) => a + b.value, 0);

  const onDrop = (stage: string) => {
    if (!dragId) return;
    const deal = localDeals.find(d => d.id === dragId);
    setLocalDeals(ds => ds.map(d => (d.id === dragId ? { ...d, stage } : d)));
    setDragId(null);
    setOverStage(null);
    if (deal) startTransition(() => { moveDeal(dragId, stage); });
  };

  return (
    <div style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: '#5f5f66' }}>Drag a card to change stage</span>
        <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{boardValue}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(196px,1fr))', gap: 12, alignItems: 'start' }}>
        {STAGES.map(col => {
          const cards = byStage(col.id);
          const over = overStage === col.id;
          return (
            <section
              key={col.id}
              onDragOver={e => { e.preventDefault(); setOverStage(col.id); }}
              onDragLeave={() => setOverStage(s => (s === col.id ? null : s))}
              onDrop={() => onDrop(col.id)}
              style={{
                borderRadius: 13, padding: 12, minHeight: 180,
                transition: 'background 140ms ease,border-color 140ms ease',
                border: `1px solid ${over ? '#146c43' : '#e6e4ec'}`,
                background: over ? '#f1f8f3' : '#f7f6f2',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px 10px 2px' }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: col.color }} aria-hidden="true" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{col.name}</span>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66' }}>{cards.length}</span>
                <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: '#5f5f66' }}>{money(sum(cards))}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 70 }}>
                {cards.map(card => (
                  <article
                    key={card.id}
                    draggable
                    onDragStart={() => setDragId(card.id)}
                    onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    style={{
                      borderRadius: 12, padding: 11, cursor: 'grab', background: '#ffffff',
                      border: `1px solid ${dragId === card.id ? '#146c43' : '#e6e4ec'}`,
                      opacity: dragId === card.id ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500, minWidth: 0 }}>{card.name}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 11.5, whiteSpace: 'nowrap' }}>{money(card.value)}</span>
                    </div>
                    <div style={{ marginTop: 3, fontSize: 12.5, color: '#5f5f66' }}>{card.company}</div>
                    <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12.5, color: '#45454d' }}>{card.source}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: card.age > 20 ? '#b02a12' : card.age > 10 ? '#8a5a00' : '#5f5f66' }}>{card.age}d</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
