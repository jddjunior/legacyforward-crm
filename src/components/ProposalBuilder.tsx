'use client';

import { useState } from 'react';
import { createProposal } from '@/app/actions/proposals';
import { Plus, Trash2 } from 'lucide-react';

interface Page {
  id: number;
  name: string;
  sections: { id: number; heading: string; body: string }[];
}

let sectionCounter = 0;
let pageCounter = 0;

export default function ProposalBuilder({ clientOrgs }: { clientOrgs: { id: string; name: string }[] }) {
  const [pages, setPages] = useState<Page[]>([
    { id: pageCounter++, name: 'Home', sections: [{ id: sectionCounter++, heading: '', body: '' }] },
  ]);

  function addPage() {
    setPages([...pages, { id: pageCounter++, name: `Page ${pages.length + 1}`, sections: [{ id: sectionCounter++, heading: '', body: '' }] }]);
  }

  function removePage(pageId: number) {
    setPages(pages.filter(p => p.id !== pageId));
  }

  function addSection(pageId: number) {
    setPages(pages.map(p => p.id === pageId ? { ...p, sections: [...p.sections, { id: sectionCounter++, heading: '', body: '' }] } : p));
  }

  function removeSection(pageId: number, sectionId: number) {
    setPages(pages.map(p => p.id === pageId ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) } : p));
  }

  function updatePageName(pageId: number, name: string) {
    setPages(pages.map(p => p.id === pageId ? { ...p, name } : p));
  }

  function updateSection(pageId: number, sectionId: number, field: 'heading' | 'body', value: string) {
    setPages(pages.map(p => p.id === pageId ? {
      ...p,
      sections: p.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s),
    } : p));
  }

  return (
    <form action={createProposal} className="space-y-6">
      {/* Proposal meta */}
      <div className="card p-5 grid grid-cols-2 gap-4">
        <div>
          <label className="label block mb-1.5">Proposal Title *</label>
          <input name="title" required className="input" placeholder="Website Build Proposal" />
        </div>
        <div>
          <label className="label block mb-1.5">Client</label>
          <select name="clientOrgId" className="input">
            {clientOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>

      {/* Pages */}
      {pages.map((page) => (
        <div key={page.id} className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <input
              value={page.name}
              onChange={(e) => updatePageName(page.id, e.target.value)}
              className="input flex-1 font-medium"
              placeholder="Page name"
            />
            {pages.length > 1 && (
              <button type="button" onClick={() => removePage(page.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {page.sections.map((section) => (
            <div key={section.id} className="border border-ink-line rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-ink-subtle">Section</span>
                {page.sections.length > 1 && (
                  <button type="button" onClick={() => removeSection(page.id, section.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                name="pageHeading"
                value={section.heading}
                onChange={(e) => updateSection(page.id, section.id, 'heading', e.target.value)}
                className="input mb-2"
                placeholder="Section heading"
              />
              <textarea
                name="pageBody"
                value={section.body}
                onChange={(e) => updateSection(page.id, section.id, 'body', e.target.value)}
                className="input"
                rows={3}
                placeholder="Section body text…"
              />
              <input type="hidden" name="pageName" value={page.name} />
            </div>
          ))}

          <button type="button" onClick={() => addSection(page.id)} className="btn btn-ghost text-xs h-8">
            <Plus size={14} /> Add Section
          </button>
        </div>
      ))}

      <div className="flex gap-3">
        <button type="button" onClick={addPage} className="btn">
          <Plus size={16} /> Add Page
        </button>
        <button type="submit" className="btn btn-primary flex-1 justify-center">Send Proposal</button>
      </div>
    </form>
  );
}
