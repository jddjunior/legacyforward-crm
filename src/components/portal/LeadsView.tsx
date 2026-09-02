'use client';

import { useState, useTransition } from 'react';
import { createLead } from '@/app/actions/leads';

export interface LeadRow {
  name: string;
  company: string;
  stage: string;
  color: string;
  source: string;
  score: number;
  scoreColor: string;
  value: string;
  touch: string;
}

export default function LeadsView({ leadRows, leadValue }: { leadRows: LeadRow[]; leadValue: string }) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const filtered = q
    ? leadRows.filter(l => (l.name + l.company + l.source + l.stage).toLowerCase().includes(q))
    : leadRows;

  const th: React.CSSProperties = { textAlign: 'left', padding: '8px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f5f66', borderBottom: '1px solid #e9e6de' };
  const thMid: React.CSSProperties = { ...th, padding: '8px 10px' };
  const thRight: React.CSSProperties = { ...thMid, textAlign: 'right' };

  return (
    <div>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: '1px solid #e9e6de' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter leads…"
          aria-label="Filter leads"
          style={{ height: 30, width: 230, borderRadius: 11, border: '1px solid #e9e6de', padding: '0 10px', fontSize: 12.5 }}
        />
        <span style={{ fontSize: 12.5, color: '#5f5f66' }}>{leadRows.length} open · {leadValue}</span>
        <button type="button" onClick={() => setShowForm(v => !v)} style={{ marginLeft: 'auto', height: 30, padding: '0 13px', borderRadius: 11, border: 'none', background: '#146c43', color: '#ffffff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Add lead</button>
      </div>

      {showForm && (
        <form
          action={(fd) => { startTransition(() => { createLead(fd); }); setShowForm(false); }}
          style={{ padding: '14px 20px', borderBottom: '1px solid #e9e6de', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}
        >
          <input name="name" required placeholder="Name *" style={{ height: 34, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 12px', fontSize: 12.5 }} />
          <input name="email" type="email" placeholder="Email" style={{ height: 34, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 12px', fontSize: 12.5 }} />
          <input name="phone" placeholder="Phone" style={{ height: 34, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 12px', fontSize: 12.5 }} />
          <select name="source" style={{ height: 34, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 10px', fontSize: 12.5, background: '#ffffff' }}>
            <option value="">Source —</option>
            <option value="call">Call</option>
            <option value="form">Form</option>
            <option value="referral">Referral</option>
            <option value="organic">Organic</option>
          </select>
          <button type="submit" style={{ height: 34, padding: '0 14px', borderRadius: 11, border: 'none', background: '#146c43', color: '#ffffff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Create lead</button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Lead</th>
            <th style={thMid}>Stage</th>
            <th style={thMid}>Source</th>
            <th style={thRight}>Fit</th>
            <th style={thRight}>Value</th>
            <th style={{ ...th, textAlign: 'right' }}>Last touch</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #efede7' }}>
              <td style={{ padding: '12px 20px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{l.name}</div>
                <div style={{ marginTop: 2, fontSize: 12.5, color: '#5f5f66' }}>{l.company}</div>
              </td>
              <td style={{ padding: '12px 10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: l.color }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: l.color }} aria-hidden="true" />{l.stage}
                </span>
              </td>
              <td style={{ padding: '12px 10px', fontSize: 13, color: '#2b2b33' }}>{l.source}</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: l.scoreColor }}>{l.score}</td>
              <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5 }}>{l.value}</td>
              <td style={{ padding: '12px 20px', textAlign: 'right', fontSize: 12.5, color: '#5f5f66' }}>{l.touch}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div style={{ padding: '26px 20px', fontSize: 13, color: '#5f5f66' }}>No leads match that filter.</div>
      )}
    </div>
  );
}
