'use client';

import { useState } from 'react';
import { money } from '@/lib/design/data';

export interface CustomerRow {
  company: string;
  contact: string;
  serviceLine: string;
  since: string;
  health: string;
  kind: string;
  value: number;
  note: string;
}

const CUST_VIEWS: { id: string; label: string; test: (c: CustomerRow) => boolean }[] = [
  { id: 'all', label: 'All accounts', test: () => true },
  { id: 'attention', label: 'Needs attention', test: c => c.kind === 'bad' || c.kind === 'warn' },
  { id: 'advocates', label: 'Advocates', test: c => /advocate/i.test(c.health) },
  { id: 'top', label: 'Contracts over $40k', test: c => c.value >= 40000 },
  { id: 'recurring', label: 'On a maintenance plan', test: c => /maintenance/i.test(c.serviceLine) },
  { id: 'newest', label: 'Joined this year', test: c => /2026/.test(c.since) },
];

const HEALTH_CHIPS = [
  { id: 'good', label: 'Healthy', dot: '#1f6b18' },
  { id: 'warn', label: 'Watch', dot: '#8a5a00' },
  { id: 'bad', label: 'At risk', dot: '#b02a12' },
];

const kindColor = (kind: string) => (kind === 'bad' ? '#b02a12' : kind === 'warn' ? '#8a5a00' : kind === 'info' ? '#2a49b8' : '#1f6b18');

export default function CustomersView({ customers }: { customers: CustomerRow[] }) {
  const [view, setView] = useState('all');
  const [health, setHealth] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('value');

  const activeView = CUST_VIEWS.find(v => v.id === view) || CUST_VIEWS[0];
  const q = query.trim().toLowerCase();
  const filtered = customers.filter(c => {
    if (!activeView.test(c)) return false;
    if (health.length && !health.includes(c.kind)) return false;
    if (q && (c.company + c.contact + c.serviceLine + c.note).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });

  const healthRank: Record<string, number> = { bad: 0, warn: 1, good: 2 };
  filtered.sort((a, b) => {
    if (sort === 'name') return a.company.localeCompare(b.company);
    if (sort === 'health') return (healthRank[a.kind] ?? 3) - (healthRank[b.kind] ?? 3) || b.value - a.value;
    return b.value - a.value;
  });

  const isFiltered = view !== 'all' || health.length > 0 || q !== '';
  const clearFilters = () => { setView('all'); setHealth([]); setQuery(''); };

  const svcTokens: string[] = [];
  customers.forEach(c => String(c.serviceLine || '').split(',').forEach(t => {
    const v = t.trim();
    if (v && v !== '—' && !svcTokens.includes(v.toLowerCase())) svcTokens.push(v.toLowerCase());
  }));

  const th: React.CSSProperties = { textAlign: 'left', padding: '8px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f5f66', borderBottom: '1px solid #e9e6de' };
  const thMid: React.CSSProperties = { ...th, padding: '8px 10px' };
  const thRight: React.CSSProperties = { ...thMid, textAlign: 'right' };

  return (
    <div>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9e6de' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, fontWeight: 500, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#5c5a52' }}>Saved views</span>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#5f5f66' }}>
            {customers.length} accounts · {money(filtered.reduce((a, b) => a + b.value, 0))} contracted
          </span>
          <button type="button" style={{ height: 32, padding: '0 14px', borderRadius: 999, border: 'none', background: '#146c43', color: '#ffffff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Add customer</button>
        </div>
        <div style={{ marginTop: 11, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CUST_VIEWS.map(v => {
            const on = v.id === view;
            const count = customers.filter(v.test).length;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, padding: '0 6px 0 13px', borderRadius: 999,
                  cursor: 'pointer', fontSize: 12.5, fontWeight: on ? 600 : 500,
                  border: `1px solid ${on ? '#146c43' : '#e2ded4'}`,
                  background: on ? '#e8f3ec' : '#ffffff',
                  color: on ? '#0f5132' : '#3f3f47',
                }}
              >
                <span>{v.label}</span>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 11, fontWeight: 600, borderRadius: 999, minWidth: 20, textAlign: 'center', padding: '2px 6px', background: on ? '#146c43' : '#f2efe8', color: on ? '#ffffff' : '#5c5a52' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 20px', borderBottom: '1px solid #e9e6de', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search accounts, contacts, notes…"
          aria-label="Search customers"
          style={{ height: 34, width: 250, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 12px', fontSize: 12.5 }}
        />
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {HEALTH_CHIPS.map(h => {
            const on = health.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setHealth(hs => (on ? hs.filter(x => x !== h.id) : [...hs, h.id]))}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 13px', borderRadius: 999,
                  cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
                  border: `1px solid ${on ? '#146c43' : '#e2ded4'}`,
                  background: on ? '#e8f3ec' : '#ffffff',
                  color: on ? '#0f5132' : '#3f3f47',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: 999, background: h.dot }} aria-hidden="true" />
                {h.label}
              </button>
            );
          })}
        </span>
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort accounts" style={{ height: 34, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 10px', fontSize: 12.5, background: '#ffffff', cursor: 'pointer' }}>
          <option value="value">Largest contract</option>
          <option value="name">Account name</option>
          <option value="health">Health first</option>
        </select>
        {isFiltered && (
          <button type="button" onClick={clearFilters} style={{ height: 34, padding: '0 13px', borderRadius: 999, border: '1px solid #e2ded4', background: '#ffffff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Clear filters</button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Account</th>
            <th style={thMid}>Health</th>
            <th style={thMid}>Services</th>
            <th style={thMid}>Open note</th>
            <th style={thRight}>Contract</th>
            <th style={{ ...th, textAlign: 'right' }}>Since</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #efede7' }}>
              <td style={{ padding: '11px 20px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.company}</div>
                <div style={{ marginTop: 2, fontSize: 12.5, color: '#5f5f66' }}>{c.contact}</div>
              </td>
              <td style={{ padding: '11px 10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: kindColor(c.kind) }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: kindColor(c.kind) }} aria-hidden="true" />{c.health}
                </span>
              </td>
              <td style={{ padding: '11px 10px', fontSize: 12, color: '#2b2b33' }}>{c.serviceLine}</td>
              <td style={{ padding: '11px 10px', fontSize: 12.5, color: '#5f5f66', maxWidth: 300 }}>{c.note}</td>
              <td style={{ padding: '11px 10px', textAlign: 'right', fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12.5 }}>{money(c.value)}</td>
              <td style={{ padding: '11px 20px', textAlign: 'right', fontSize: 12.5, color: '#5f5f66' }}>{c.since}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div style={{ padding: '30px 20px', fontSize: 13, color: '#5f5f66' }}>
          No accounts match. <button type="button" onClick={clearFilters} style={{ background: 'none', border: 'none', padding: 0, color: '#146c43', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Clear the filters</button> to see all {customers.length}.
        </div>
      )}
    </div>
  );
}
