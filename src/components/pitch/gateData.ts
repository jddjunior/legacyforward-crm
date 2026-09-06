// Pitch gateway definitions ported from the handed-over design
// ("Customer Portal v4.dc.html" — PITCH GATEWAY OVERLAY).

export type GateStage = 'preview' | 'payment' | 'access' | 'setup';

export const GATE_STEPS = ['Website review', 'Payment', 'Access', 'Onboarding'];
export const GATE_ORDER: GateStage[] = ['preview', 'payment', 'access', 'setup'];

export const DEVICES = [
  { id: 'desktop', label: 'Desktop', w: '100%', pad: '30px 34px', h1: '34px', hero: '260px', nav: true },
  { id: 'tablet', label: 'Tablet', w: '820px', pad: '26px 26px', h1: '30px', hero: '220px', nav: true },
  { id: 'mobile', label: 'Mobile', w: '392px', pad: '20px 18px', h1: '26px', hero: '180px', nav: false },
];

export const UPLOAD_DEFS = [
  { id: 'brandform', name: 'Brand information form', detail: 'Promise, proof points, service areas, words to avoid' },
  { id: 'logo', name: 'Logo files', detail: 'SVG, PNG on light and dark, horizontal lockup' },
  { id: 'kit', name: 'Brand kit (optional)', detail: 'Color values, type, existing guideline PDF' },
  { id: 'photos', name: 'Photos', detail: 'Sorted into labeled buckets on upload' },
  { id: 'videos', name: 'Videos', detail: 'Walkthroughs, testimonials, drone, raw ad cuts' },
  { id: 'pricing', name: 'Pricing and margin sheet', detail: 'Loads into Services with margin floors' },
];

export const TECH_DEFS = [
  { key: 'crm', label: 'CRM', options: ['HubSpot', 'Salesforce', 'Pipedrive'] },
  { key: 'email', label: 'Email and SMS', options: ['Klaviyo', 'Mailchimp', 'Customer.io'] },
  { key: 'calls', label: 'Call tracking', options: ['CallRail', 'WhatConverts', 'None yet'] },
  { key: 'pay', label: 'Payments', options: ['Stripe', 'QuickBooks', 'Square'] },
];

export const CONN_DEFS = [
  { id: 'gsc', name: 'Google Search Console', role: 'Indexing, queries, page experience' },
  { id: 'gbp', name: 'Google Business Profile', role: 'Local listings, reviews, posts' },
  { id: 'ga4', name: 'Google Analytics 4', role: 'Behavior and conversion events' },
  { id: 'gads', name: 'Google Ads', role: 'Search, PMax, call tracking' },
  { id: 'meta', name: 'Meta Ads', role: 'Paid social and retargeting' },
  { id: 'tiktok', name: 'TikTok Ads', role: 'Short-form video testing' },
  { id: 'hubspot', name: 'HubSpot CRM', role: 'Deal stages, owners, handoffs' },
  { id: 'klaviyo', name: 'Klaviyo', role: 'Lifecycle email and flows' },
  { id: 'twilio', name: 'Twilio SMS', role: 'Appointment and storm alerts' },
  { id: 'yelp', name: 'Yelp', role: 'Review aggregation' },
  { id: 'callrail', name: 'CallRail', role: 'Call attribution and recording' },
  { id: 'stripe', name: 'Stripe', role: 'Setup fee and monthly billing' },
];

export const SETUP_PANE_COPY: Record<string, { title: string; body: string }> = {
  brand: { title: 'Brand information and data uploads', body: 'Everything here becomes your brand agentic wiki and the databases behind every asset we produce.' },
  tech: { title: 'Software and tech selection', body: 'Pick the systems your portal reads from and writes to. This determines which connections we request.' },
  conn: { title: 'Service connections', body: 'Each service needs specific read and write access, stored per service so the right system gets the right handoff.' },
  reviews: { title: 'Review pulling and approval', body: 'We pull from your aggregators. Only reviews you approve appear on the site or in creative.' },
};

// Build fee charged by /api/payments/checkout when no amount is passed.
export const BUILD_FEE = 2500;

export interface ProposalSection {
  heading: string;
  body: string;
  image?: string;
}

export interface ProposalPageDef {
  name: string;
  sections: ProposalSection[];
}

// Maps a proposal page from the database onto the site mock's layout slots.
export function mapProposalPage(page: ProposalPageDef) {
  const sections = (page?.sections as ProposalSection[]) || [];
  const [hero, ...rest] = sections;
  return {
    id: page?.name,
    label: page?.name || 'Page',
    eyebrow: page?.name || 'Page',
    h1: hero?.heading || 'Page heading',
    sub: hero?.body || '',
    heroImg: hero?.image || 'hero — image',
    cta: 'Get started',
    cards: rest.slice(0, 3).map((s) => ({ title: s.heading, body: s.body })),
    h2: rest.length > 3 ? rest[3].heading : null,
    paras: rest.length > 4 ? rest.slice(4).map((s) => s.body) : [],
    bodyImg: 'photo — supporting image',
  };
}

export const stripeBg = 'repeating-linear-gradient(135deg,#eceae4 0 10px,#e3e0d8 10px 20px)';
