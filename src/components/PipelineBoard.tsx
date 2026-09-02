'use client';

import { useState } from 'react';
import { moveDeal } from '@/app/actions/deals';

const STAGES = ['lead', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
}

export default function PipelineBoard({ deals }: { deals: Deal[] }) {
  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter(d => d.stage === stage);
        const total = stageDeals.reduce((s, d) => s + d.value, 0);
        return (
          <div
            key={stage}
            className="w-64 flex-shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async () => {
              if (dragId) {
                setDragId(null);
                await moveDeal(dragId, stage);
              }
            }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-semibold capitalize">{stage}</span>
              <span className="text-xs text-ink-muted">{stageDeals.length} · ${(total / 100).toLocaleString()}</span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => setDragId(deal.id)}
                  className="card p-3.5 cursor-grab active:cursor-grabbing hover:border-brand transition-colors"
                >
                  <div className="text-sm font-medium mb-1">{deal.title}</div>
                  <div className="text-xs text-ink-muted">${(deal.value / 100).toLocaleString()}</div>
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div className="text-xs text-ink-subtle text-center py-8 border border-dashed border-ink-line rounded-xl">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
