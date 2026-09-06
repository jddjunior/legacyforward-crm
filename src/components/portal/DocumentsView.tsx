'use client';

import { useState, useTransition } from 'react';
import { createDocument } from '@/app/actions/documents';

export interface DocRow {
  id: string;
  title: string;
  category: string;
  size: string | null;
  status: string;
  updated: string;
  content: string | null;
}

// Documents — the brand wiki. Searchable list, detail pane, and an
// upload path that indexes new material for agent retrieval.
export default function DocumentsView({ docs }: { docs: DocRow[] }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(docs[0]?.id ?? null);
  const [showUpload, setShowUpload] = useState(false);
  const [, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const filtered = q ? docs.filter(d => (d.title + ' ' + d.category + ' ' + (d.content || '')).toLowerCase().includes(q)) : docs;
  const active = docs.find(d => d.id === selectedId) || filtered[0] || null;

  const stats = [
    { label: 'Documents', value: String(docs.length) },
    { label: 'Indexed', value: String(docs.filter(d => d.status === 'indexed').length) },
    { label: 'Processing', value: String(docs.filter(d => d.status === 'processing').length) },
    { label: 'Locked', value: String(docs.filter(d => d.status === 'locked').length) },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', alignItems: 'stretch' }}>
      <div style={{ borderRight: '1px solid #e9e6de' }}>
        <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid #e9e6de' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search the wiki…"
            aria-label="Search documents"
            style={{ flex: 1, height: 30, borderRadius: 11, border: '1px solid #e9e6de', padding: '0 10px', fontSize: 12.5 }}
          />
          <button type="button" onClick={() => setShowUpload(v => !v)} style={{ height: 30, padding: '0 12px', borderRadius: 11, border: '1px solid #c6c6ce', background: '#ffffff', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Upload</button>
        </div>

        {showUpload && (
          <form
            action={(fd) => { startTransition(() => { createDocument(fd); }); setShowUpload(false); }}
            style={{ padding: '14px 20px', borderBottom: '1px solid #e9e6de', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <input name="title" required placeholder="Title *" style={{ height: 34, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 12px', fontSize: 12.5 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <select name="category" style={{ height: 34, borderRadius: 11, border: '1px solid #e2ded4', padding: '0 10px', fontSize: 12.5, background: '#ffffff', flex: '0 0 130px' }}>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="TXT">TXT</option>
                <option value="PNG">PNG</option>
              </select>
              <button type="submit" style={{ height: 34, padding: '0 14px', borderRadius: 11, border: 'none', background: '#146c43', color: '#ffffff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>Index document</button>
            </div>
            <textarea name="content" rows={3} placeholder="Paste the text to index for retrieval…" style={{ borderRadius: 11, border: '1px solid #e2ded4', padding: '8px 12px', fontSize: 12.5, resize: 'vertical' }} />
          </form>
        )}

        {filtered.map(d => {
          const on = active && d.id === active.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(d.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '11px 20px', borderBottom: '1px solid #efede7',
                background: on ? '#f1f8f3' : '#ffffff', borderLeft: on ? '3px solid #146c43' : '3px solid transparent', cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12, color: '#45454d', border: '1px solid #e9e6de', borderRadius: 4, padding: '1px 4px' }}>{d.category}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 0 }}>{d.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#5f5f66', whiteSpace: 'nowrap' }}>{d.updated}</span>
              </span>
              <span style={{ display: 'block', marginTop: 4, fontSize: 12.5, color: '#5f5f66', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {(d.content || '').slice(0, 90) || 'No extracted text'}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '26px 20px', fontSize: 12.5, color: '#5f5f66' }}>No documents match that search.</div>
        )}
      </div>

      <div style={{ padding: '22px 24px', minWidth: 0 }}>
        {active ? (
          <>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 12, color: '#45454d', border: '1px solid #e9e6de', borderRadius: 4, padding: '1px 5px', display: 'inline-block' }}>{active.category}</span>
            <h2 style={{ margin: '10px 0 0 0', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>{active.title}</h2>
            <div style={{ marginTop: 5, fontSize: 12.5, color: '#5f5f66' }}>Updated {active.updated} · {active.size || '—'} · {active.status}</div>
            <p style={{ margin: '16px 0 0 0', fontSize: 13.5, lineHeight: 1.75, color: '#2b2b33', maxWidth: 620 }}>
              {active.content || 'No extracted text yet — processing runs in the background and this page updates when it lands.'}
            </p>
            <div style={{ marginTop: 18, borderTop: '1px solid #efede7', paddingTop: 14, maxWidth: 620 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f5f66' }}>Agent retrieval</div>
              <div style={{ marginTop: 7, fontSize: 13, lineHeight: 1.65, color: '#2b2b33' }}>
                Indexed and cited on quote drafts, ad copy, and approvals that touch {active.title.toLowerCase()}.
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              {stats.map(st => (
                <div key={st.label}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5f5f66' }}>{st.label}</div>
                  <div style={{ marginTop: 4, fontFamily: "'Geist Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>{st.value}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: '#5f5f66' }}>Select a document to read it.</div>
        )}
      </div>
    </div>
  );
}
