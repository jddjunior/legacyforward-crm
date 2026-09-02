'use client';

import { useState } from 'react';
import { moveDeal } from '@/app/actions/deals';

const STAGES = [
  { id: 'lead', name: 'New', color: '#6b6b74' },
  { id: 'contacted', name: 'Qualified', color: '#146c43' },
  { id: 'qualified', name: 'Proposal', color: '#8a5a00' },
  { id: 'proposal', name: 'Negotiation', color: '#b02a12' },
  { id: 'won', name: 'Won', color: '#1f6b18' },
];

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
        const stageDeals = deals.filter(d => d.stage === stage.id);
        const total = stageDeals.reduce((s, d) => s + d.value, 0);
        return (
          <div
            key={stage.id}
            className="w-64 flex-shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async () => {
              if (dragId) {
                setDragId(null);
                await moveDeal(dragId, stage.id);
              }
            }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                <span className="text-[13.5px] font-semibold text-[#14141a]">{stage.name}</span>
              </span>
              <span className="mono text-[12px] text-[#5f5f66]">{stageDeals.length} · ${(total / 100).toLocaleString()}</span>
            </div>
            <div
              className="space-y-2 min-h-[180px] rounded-[13px] p-3 border transition-colors"
              style={{ background: '#f7f6f2', borderColor: dragId ? '#146c43' : '#e6e4ec' }}
            >
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => setDragId(deal.id)}
                  className="rounded-[12px] p-[11px] cursor-grab active:cursor-grabbing bg-white border transition-all"
                  style={{
                    borderColor: dragId === deal.id ? '#146c43' : '#e6e4ec',
                    opacity: dragId === deal.id ? 0.5 : 1,
                  }}
                >
                  <div className="text-[13.5px] font-medium text-[#14141a] mb-1">{deal.title}</div>
                  <div className="mono text-[12px] text-[#5f5f66]">${(deal.value / 100).toLocaleString()}</div>
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div className="text-[12px] text-[#918da0] text-center py-8 border border-dashed border-[#e6e4ec] rounded-[12px]">
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
