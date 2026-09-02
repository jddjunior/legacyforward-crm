// Design-system constants — icons, stage colors, page titles, and small
// formatting helpers ported from "Customer Portal v4.dc.html".
// No demo rows live here; every page renders real database data.

export const STAGES = [
  { id: 'new', name: 'New', color: '#5f5f66' },
  { id: 'qualified', name: 'Qualified', color: '#2a49b8' },
  { id: 'proposal', name: 'Proposal', color: '#146c43' },
  { id: 'negotiation', name: 'Negotiation', color: '#8a5a00' },
  { id: 'won', name: 'Won', color: '#1f6b18' },
];

export const NAV = {
  names: ['Overview', 'Marketing', 'Catalog', 'Account'],
  def: [
    [['dashboard', 'Dashboard', ''], ['copilot', 'Live Calls', 'LIVE'], ['tracking', 'Lead Tracking', ''], ['approvals', 'Approvals', ''], ['leads', 'Leads', ''], ['customers', 'Customers', ''], ['pipeline', 'Pipeline', ''], ['reviews', 'Reviews', '']],
    [['website', 'Website', ''], ['seo', 'SEO', ''], ['socials', 'Socials', ''], ['ads', 'Ads', '']],
    [['services', 'Services', ''], ['media', 'Media', ''], ['documents', 'Documents', '']],
    [['connections', 'Connections', ''], ['profile', 'Profile', ''], ['settings', 'Settings', ''], ['logout', 'Logout', '']],
  ],
  icons: {
    dashboard: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
    copilot: 'M12 3.5 13.9 8.6l5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
    tracking: 'M3.5 6.5a2 2 0 0 1 2-2h2l1.5 3.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 3.5 1.5v2a2 2 0 0 1-2 2A14.5 14.5 0 0 1 3.5 6.5M15 4.5h5.5V10',
    approvals: 'M9 12.5l2.2 2.2L15.5 10M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z',
    leads: 'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M18 20v-1.5a4 4 0 0 0-3-3.87M15.5 3.63a3.5 3.5 0 0 1 0 6.74',
    customers: 'M4 20v-1.5A4.5 4.5 0 0 1 8.5 14h3a4.5 4.5 0 0 1 4.5 4.5V20M10 11a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5M17.5 20v-1.2a3.8 3.8 0 0 0-2.2-3.4M16 10.8a2.9 2.9 0 0 0 0-5.4',
    pipeline: 'M5 19.5V9M10.5 19.5V5M16 19.5v-7M21 19.5H3.5',
    reviews: 'M12 3.5l2.5 5.1 5.6.8-4 4 .9 5.6-5 2.7-5-2.7.9-5.6-4-4 5.6-.8z',
    website: 'M3.5 6.5A1.5 1.5 0 0 1 5 5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5zM3.5 9.5h15M9 5V3.5M15 5V3.5',
    seo: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13M15.5 15.5 20 20',
    socials: 'M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5zM4.5 9.5h15M9 5V3.5M15 5V3.5',
    ads: 'M3.5 10.5 20.5 4l-2.8 16.5-5.4-5.2zM12.3 15.3 9.8 20l-.8-4.7',
    services: 'M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8zM14 3.5V8h4.5M9 13h6M9 16.5h4',
    media: 'M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5zM4.5 9.5h15M9 5V3.5M15 5V3.5',
    documents: 'M5 5.5h14v10H9l-4 3.5z',
    connections: 'M3.5 12h4l2-4 3 8 2.5-5 1.5 3h4',
    profile: 'M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4.5 20.5a7.5 7.5 0 0 1 15 0',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3H9.8l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12',
    logout: 'M14 3.5H6A1.5 1.5 0 0 0 4.5 5v14A1.5 1.5 0 0 0 6 20.5h8M10 12h9.5M16.5 8.5 20 12l-3.5 3.5',
  },
};

export const TITLES: Record<string, [string, string]> = {
  dashboard: ['Dashboard', 'Demand, pipeline, and what needs your decision today'],
  copilot: ['Live Calls', 'Real-time coaching on the call happening right now'],
  tracking: ['Lead Tracking', 'Every lead and call with the campaign, keyword, and page that produced it'],
  approvals: ['Approvals', 'Nothing publishes, launches, or reprices without your read'],
  leads: ['Leads', 'Source, fit, and value on every inbound'],
  customers: ['Customers', 'Won accounts, contract value, account health'],
  pipeline: ['Pipeline', 'Drag to change stage'],
  reviews: ['Reviews', 'Pulled from your aggregators — you choose what publishes to your site'],
  website: ['Website', 'Build status and change requests'],
  seo: ['SEO', 'Visibility and the pages earning it'],
  socials: ['Socials', 'Scheduled content — click any item to review'],
  ads: ['Ads', 'Flight calendar across search, social, CTV, programmatic'],
  services: ['Services', 'Catalog, pricing, margin floor'],
  media: ['Media', 'Labeled buckets for organized agent retrieval'],
  documents: ['Documents', 'Your brand wiki — searchable, indexed for retrieval'],
  connections: ['Connections', 'Every platform your stack reads from and writes to'],
  profile: ['Profile', 'Account details and portal access'],
  settings: ['Settings', 'Notifications, approval rules, automation limits'],
  onboarding: ['Setup record', 'What you completed to open the portal'],
};

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export function dotMatrix(pct: number): { style: React.CSSProperties }[] {
  const total = 48, on = Math.round((pct / 100) * total);
  const out: { style: React.CSSProperties }[] = [];
  for (let i = 0; i < total; i++) {
    const col = i % 16, row = Math.floor(i / 16);
    const rank = col * 3 + (2 - row);
    const lit = rank < on;
    const shade = lit ? (rank > on - 6 ? '#1fa055' : '#146c43') : '#e4e1d8';
    out.push({ style: { display: 'block', aspectRatio: '1', borderRadius: '2px', background: shade } });
  }
  return out;
}
