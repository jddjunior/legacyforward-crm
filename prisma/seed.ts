import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Only seed an empty database so data created in the app survives restarts.
  // Run with SEED_RESET=1 to wipe and reseed from scratch.
  const hasData = (await prisma.org.count()) > 0;
  if (hasData && process.env.SEED_RESET !== '1') {
    console.log('Database already has data — skipping base seed.');
    await seedMarketing();
    return;
  }

  console.log('Cleaning existing data…');
  await prisma.call.deleteMany();
  await prisma.document.deleteMany();
  await prisma.siteRequest.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.campaign.deleteMany();
  // Clean up in dependency order
  await prisma.changeRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.review.deleteMany();
  await prisma.service.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.org.deleteMany();

  console.log('Seeding database…');

  // ── Agency ──────────────────────────────────────────
  const agency = await prisma.org.create({
    data: {
      name: 'Lantern Field Agency',
      slug: 'lantern-field',
      isAgency: true,
      onboardingStage: 'active',
    },
  });

  // ── Users ───────────────────────────────────────────
  const agencyAdmin = await prisma.user.create({
    data: {
      email: 'priya@lanternfield.com',
      name: 'Priya Raman',
      memberships: {
        create: { orgId: agency.id, role: 'agency_admin' },
      },
    },
  });

  // ── Client orgs ────────────────────────────────────
  const clientData = [
    { name: 'Apex Roofing Co', slug: 'apex-roofing', stage: 'active' },
    { name: 'Cascade HVAC', slug: 'cascade-hvac', stage: 'brand_uploaded' },
    { name: 'Pinnacle Plumbing', slug: 'pinnacle-plumbing', stage: 'proposal_approved' },
  ];

  for (const cd of clientData) {
    const org = await prisma.org.create({
      data: {
        name: cd.name,
        slug: cd.slug,
        onboardingStage: cd.stage,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: `owner@${cd.slug}.com`,
        name: `${cd.name.split(' ')[0]} Owner`,
        memberships: { create: { orgId: org.id, role: 'owner' } },
      },
    });

    // Agency admin also has membership on client orgs
    await prisma.membership.create({
      data: { userId: agencyAdmin.id, orgId: org.id, role: 'agency_admin' },
    });

    // ── Leads ────────────────────────────────────────
    const leadNames = [
      ['John Smith', 'call', 'qualified'], ['Sarah Chen', 'form', 'contacted'],
      ['Mike Davis', 'referral', 'new'], ['Emily Brown', 'organic', 'qualified'],
      ['Tom Wilson', 'call', 'contacted'], ['Lisa Garcia', 'form', 'new'],
      ['James Miller', 'call', 'lost'], ['Anna Taylor', 'referral', 'qualified'],
      ['Robert Lee', 'organic', 'contacted'], ['Jessica Wang', 'form', 'new'],
    ];
    for (const [name, source, status] of leadNames) {
      await prisma.lead.create({
        data: {
          orgId: org.id,
          name: name as string,
          email: `${(name as string).toLowerCase().replace(' ', '.')}@email.com`,
          source: source as string,
          status: status as string,
        },
      });
    }

    // ── Customers ────────────────────────────────────
    const customers = [
      ['Robert Homes LLC', 'robert@homes.com', 45000],
      ['Sunset Properties', 'ops@sunset.com', 12000],
      ['Green Valley Builders', 'contact@greenvalley.com', 28000],
    ];
    for (const [name, email, value] of customers) {
      await prisma.customer.create({
        data: {
          orgId: org.id,
          name: name as string,
          email: email as string,
          value: (value as number) * 100,
        },
      });
    }

    // ── Deals ────────────────────────────────────────
    const deals = [
      ['Roof replacement — R. Homes', 18000, 'won'],
      ['AC install — Sunset', 8500, 'proposal'],
      ['Full repipe — Green Valley', 22000, 'qualified'],
      ['Maintenance contract — Homes LLC', 5000, 'contacted'],
      ['Emergency repair — J. Smith', 1200, 'lead'],
      ['New construction — Apex partner', 45000, 'proposal'],
      ['Inspection package — multiple', 3000, 'lead'],
    ];
    for (const [title, value, stage] of deals) {
      await prisma.deal.create({
        data: {
          orgId: org.id,
          title: title as string,
          value: (value as number) * 100,
          stage: stage as string,
        },
      });
    }

    // ── Approvals ────────────────────────────────────
    const approvals = [
      ['ad', 'Google Ads — Fall promotion creative', 'pending'],
      ['social', 'Instagram post — Before/after roof', 'pending'],
      ['review', 'Google review response — 5-star', 'pending'],
      ['ad', 'Meta Ads — HVAC seasonal campaign', 'approved'],
      ['social', 'Facebook post — Weekly tips', 'approved'],
    ];
    for (const [type, title, status] of approvals) {
      await prisma.approval.create({
        data: {
          orgId: org.id,
          type: type as string,
          title: title as string,
          status: status as string,
        },
      });
    }

    // ── Reviews ──────────────────────────────────────
    const reviews = [
      ['google', 'Mike T.', 5, 'Excellent service, on time and professional!', 'pending'],
      ['google', 'Sarah L.', 4, 'Great work, fair pricing.', 'approved'],
      ['facebook', 'John D.', 5, 'Highly recommend this company.', 'pending'],
    ];
    for (const [source, author, rating, content, status] of reviews) {
      await prisma.review.create({
        data: {
          orgId: org.id,
          source: source as string,
          author: author as string,
          rating: rating as number,
          content: content as string,
          status: status as string,
        },
      });
    }

    // ── Services ─────────────────────────────────────
    const services = [
      ['SEO Management', 'Monthly SEO optimization and reporting', 1500, 400],
      ['Google Ads Management', 'PPC campaign management', 1200, 300],
      ['Social Media Management', 'Weekly posts across platforms', 800, 200],
      ['Website Maintenance', 'Monthly updates and security patches', 500, 100],
    ];
    for (const [name, desc, price, cost] of services) {
      await prisma.service.create({
        data: {
          orgId: org.id,
          name: name as string,
          description: desc as string,
          price: (price as number) * 100,
          cost: (cost as number) * 100,
        },
      });
    }

    // ── Connections ──────────────────────────────────
    const connections = [
      ['google_ads', 'connected'],
      ['meta', 'connected'],
      ['callrail', 'pending'],
    ];
    for (const [provider, status] of connections) {
      await prisma.connection.create({
        data: {
          orgId: org.id,
          provider: provider as string,
          status: status as string,
        },
      });
    }

    // ── Proposal (for active client) ─────────────────
    if (cd.stage !== 'proposal_approved') {
      await prisma.proposal.create({
        data: {
          orgId: org.id,
          title: `${cd.name} — Website Build Proposal`,
          status: 'sent',
          liveUrl: 'https://example.com',
          priceCents: 850000,
          pages: [
            {
              name: 'Home',
              sections: [
                { heading: 'Hero Section', body: 'Full-width hero with bold headline, background image, and call-to-action button. Optimized for conversion with clear value proposition.' },
                { heading: 'Services Overview', body: 'Grid layout showcasing core services with icons and brief descriptions. Links to individual service pages.' },
                { heading: 'Testimonials', body: 'Carousel of customer reviews with star ratings and photos. Auto-rotating with manual navigation.' },
              ],
            },
            {
              name: 'About',
              sections: [
                { heading: 'Company Story', body: 'Narrative section covering company history, mission, and values. Accompanied by timeline graphic.' },
                { heading: 'Team', body: 'Grid of team member photos with names and titles. Hover effects reveal brief bios.' },
              ],
            },
            {
              name: 'Contact',
              sections: [
                { heading: 'Contact Form', body: 'Multi-field form with name, email, phone, service type, and message. Includes Google Maps embed and business hours.' },
                { heading: 'Service Area Map', body: 'Interactive map showing coverage area with highlighted regions and service callout zones.' },
              ],
            },
          ],
        },
      });
    } else {
      // Create an approved proposal for the third client
      await prisma.proposal.create({
        data: {
          orgId: org.id,
          title: `${cd.name} — Website Build Proposal`,
          status: 'approved',
          liveUrl: 'https://example.com',
          priceCents: 1250000,
          pages: [
            {
              name: 'Home',
              sections: [
                { heading: 'Hero Section', body: 'Full-width hero with bold headline, background image, and call-to-action button.' },
                { heading: 'Services', body: 'Grid layout showcasing core services with icons.' },
              ],
            },
          ],
        },
      });
    }
  }

  // ── Demo proposal (accessible without real WorkOS) ──
  const demoOrg = await prisma.org.create({
    data: {
      name: 'Demo Contractor Co',
      slug: 'demo',
      onboardingStage: 'proposal_sent',
    },
  });

  await prisma.proposal.create({
    data: {
      orgId: demoOrg.id,
      title: 'Demo Contractor — Website Build',
      status: 'sent',
      liveUrl: 'https://example.com',
      priceCents: 850000,
      token: 'demo',
      pages: [
        {
          name: 'Home',
          sections: [
            { heading: 'Hero Section', body: 'Full-width hero with bold headline, background image, and call-to-action button. Optimized for conversion with clear value proposition and trust indicators.' },
            { heading: 'Services Overview', body: 'Grid layout showcasing core services with icons and brief descriptions. Links to individual service pages for deeper detail.' },
            { heading: 'Customer Testimonials', body: 'Carousel of customer reviews with star ratings and photos. Auto-rotating with manual navigation controls.' },
          ],
        },
        {
          name: 'About',
          sections: [
            { heading: 'Company Story', body: 'Narrative section covering company history, mission, and values. Accompanied by timeline graphic and founding story.' },
            { heading: 'Our Team', body: 'Grid of team member photos with names and titles. Hover effects reveal brief bios and specialties.' },
          ],
        },
        {
          name: 'Contact',
          sections: [
            { heading: 'Contact Form', body: 'Multi-field form with name, email, phone, service type, and message. Includes Google Maps embed and business hours.' },
            { heading: 'Service Area', body: 'Interactive map showing coverage area with highlighted regions and service callout zones.' },
          ],
        },
      ],
    },
  });

  // Demo user for testing
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@branchavenue.com',
      name: 'Demo User',
    },
  });

  await seedMarketing();

  console.log('Seed complete!');
  console.log('Demo pitch: /pitch/demo');
  console.log('Demo email: demo@branchavenue.com');
}

const DAY = 24 * 60 * 60 * 1000;

/** Demo data for the marketing modules; only fills orgs that have none yet. */
async function seedMarketing() {
  const clients = await prisma.org.findMany({ where: { isAgency: false, slug: { not: 'demo' } } });
  for (const org of clients) {
    if ((await prisma.campaign.count({ where: { orgId: org.id } })) > 0) continue;
    const now = Date.now();

    await prisma.campaign.createMany({
      data: [
        { orgId: org.id, name: 'Fall promotion — Search', platform: 'google_ads', status: 'active', budgetCents: 250000, spendCents: 143200, clicks: 612, leads: 38, startDate: new Date(now - 20 * DAY), endDate: new Date(now + 40 * DAY) },
        { orgId: org.id, name: 'Brand awareness — Reels', platform: 'meta', status: 'active', budgetCents: 120000, spendCents: 58900, clicks: 1804, leads: 14, startDate: new Date(now - 12 * DAY), endDate: new Date(now + 18 * DAY) },
        { orgId: org.id, name: 'Summer emergency service', platform: 'google_ads', status: 'ended', budgetCents: 200000, spendCents: 198400, clicks: 830, leads: 51, startDate: new Date(now - 90 * DAY), endDate: new Date(now - 30 * DAY) },
      ],
    });

    await prisma.keyword.createMany({
      data: [
        { orgId: org.id, term: `${org.name.split(' ')[1]?.toLowerCase() || 'service'} near me`, position: 4, previousPosition: 7, volume: 2400 },
        { orgId: org.id, term: 'emergency repair', position: 11, previousPosition: 9, volume: 880 },
        { orgId: org.id, term: 'free estimate', position: 2, previousPosition: 2, volume: 590 },
        { orgId: org.id, term: 'licensed contractor', position: null, previousPosition: null, volume: 320 },
      ],
    });

    await prisma.socialPost.createMany({
      data: [
        { orgId: org.id, platform: 'instagram', content: 'Before & after: full replacement finished in two days. 🏠', scheduledAt: new Date(now + 2 * DAY), status: 'scheduled' },
        { orgId: org.id, platform: 'facebook', content: 'Weekly tip: check your gutters before the first freeze.', scheduledAt: new Date(now + 5 * DAY), status: 'draft' },
        { orgId: org.id, platform: 'google', content: 'Now booking fall inspections — free estimates all month.', scheduledAt: new Date(now - 3 * DAY), status: 'published' },
      ],
    });

    await prisma.siteRequest.createMany({
      data: [
        { orgId: org.id, page: 'Home', request: 'Swap the hero photo for our new crew shot.', priority: 'normal', status: 'open' },
        { orgId: org.id, page: 'Contact', request: 'Add Saturday hours (9am–1pm).', priority: 'high', status: 'in_progress' },
      ],
    });

    await prisma.call.createMany({
      data: [
        { orgId: org.id, callerName: 'Dana Whitfield', callerNumber: '(555) 201-3344', durationSec: 312, status: 'answered', source: 'google_ads', notes: 'Wants a quote for next week.', createdAt: new Date(now - 2 * 60 * 60 * 1000) },
        { orgId: org.id, callerNumber: '(555) 889-1020', durationSec: 0, status: 'missed', source: 'organic', createdAt: new Date(now - 5 * 60 * 60 * 1000) },
        { orgId: org.id, callerName: 'Marcus Lee', callerNumber: '(555) 430-7788', durationSec: 45, status: 'voicemail', source: 'meta', notes: 'Left voicemail about warranty.', createdAt: new Date(now - DAY) },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
