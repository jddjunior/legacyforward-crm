import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning existing data…');
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
  await prisma.socialPost.deleteMany();
  await prisma.seoKeyword.deleteMany();
  await prisma.callRecord.deleteMany();
  await prisma.document.deleteMany();
  await prisma.websitePage.deleteMany();
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

    // ── Website pages ──────────────────────────────
    const sitePages: [string, string, string, string][] = [
      ['Home', '/', 'live', 'Approved draft in production'],
      ['Services', '/services', 'live', 'Indexed, earning impressions'],
      [`${cd.name.split(' ')[0]} replacement`, '/replacement', 'in_review', 'Copy with the agency for review'],
      ['Storm response', '/storm-response', 'building', 'Agent drafting the call scheduler'],
      ['Reviews', '/reviews', 'live', 'Widget pulls approved reviews only'],
      ['Contact', '/contact', 'needs_work', 'Form spam threshold tripped twice'],
    ];
    for (const [title, path, status, note] of sitePages) {
      await prisma.websitePage.create({
        data: { orgId: org.id, title, path, status, note },
      });
    }

    // ── SEO keywords ───────────────────────────────
    const KEYWORDS: Record<string, [string, string, number, number, number][]> = {
      'apex-roofing': [
        ['roof replacement near me', '/replacement', 3, 4, 9900],
        ['storm damage roof inspection', '/storm-response', 7, 12, 4400],
        ['standing seam metal roof cost', '/services', 11, -2, 3600],
        ['hail damage roof claim help', '/resources/hail-claims', 5, 6, 2900],
        ['commercial tpo roofing contractor', '/commercial', 14, 3, 1800],
        ['roof maintenance plan', '/maintenance', 2, 0, 1300],
        ['gutter installation cost', '/gutters', 9, 5, 2100],
        ['attic insulation contractor', '/insulation', 18, -4, 1600],
      ],
      'cascade-hvac': [
        ['ac replacement near me', '/replacement', 4, 3, 8100],
        ['furnace repair cost', '/services', 6, 8, 5400],
        ['heat pump installation', '/services', 9, -1, 3200],
        ['emergency ac repair', '/storm-response', 3, 2, 2700],
        ['duct cleaning service', '/services', 12, 5, 1900],
        ['smart thermostat install', '/services', 15, -3, 1100],
      ],
      'pinnacle-plumbing': [
        ['emergency plumber near me', '/storm-response', 5, 6, 7300],
        ['water heater replacement cost', '/replacement', 8, 4, 4800],
        ['drain cleaning service', '/services', 6, 2, 3100],
        ['tankless water heater install', '/services', 13, -5, 1700],
        ['repiping cost', '/services', 10, 7, 1200],
        ['leak detection service', '/services', 4, 1, 1500],
      ],
    };
    for (const [term, landingPage, position, change, volume] of KEYWORDS[cd.slug] || KEYWORDS['apex-roofing']) {
      await prisma.seoKeyword.create({
        data: { orgId: org.id, term, landingPage, position, change, volume },
      });
    }

    // ── Content calendar (socials + ads) ────────────
    const now = new Date();
    const day = (n: number) => new Date(now.getFullYear(), now.getMonth(), Math.min(n, 28), 9 + (n % 8), (n % 2) * 30);
    const posts: [string, string, string, string, string, Date][] = [
      ['social', 'instagram', 'Before/after — ' + cd.name.split(' ')[0] + ' full reroof', 'Swipe for the full tear-off. Three days, one crew, zero surprises.', 'awaiting_approval', day(3)],
      ['social', 'facebook', 'Storm season checklist', 'Five things to check on your roof before the first big storm hits.', 'approved', day(5)],
      ['social', 'instagram', 'Crew spotlight — week in the field', 'Meet the team keeping ' + cd.name.split(' ')[0].toLowerCase() + ' homes dry this month.', 'changes_requested', day(8)],
      ['social', 'facebook', 'Financing options explained', 'Same-as-cash for 12 months on full replacements. Here is how it works.', 'awaiting_approval', day(12)],
      ['social', 'nextdoor', 'Neighborhood discount — this week only', 'Book an inspection in the next 7 days and the trip fee is on us.', 'approved', day(15)],
      ['social', 'instagram', 'Reel: 60-second inspection walkthrough', 'What our inspectors actually look at, in real time.', 'approved', day(19)],
      ['social', 'facebook', 'Customer story — the Hendersons', 'From first call to final shingle in 9 days.', 'awaiting_approval', day(22)],
      ['social', 'instagram', 'Material spotlight: impact-resistant shingles', 'Why we spec Class 4 in hail country.', 'changes_requested', day(26)],
      ['ad', 'google_ads', 'Storm damage search flight', 'Hail + wind terms, geo-fenced to the service area.', 'approved', day(2)],
      ['ad', 'meta', 'Retargeting — quote abandoners', 'Dynamic ads to visitors who started but never submitted the form.', 'awaiting_approval', day(6)],
      ['ad', 'ctv', 'Fall maintenance flight — streaming', '15-second pre-roll on local news apps.', 'changes_requested', day(9)],
      ['ad', 'google_ads', 'Emergency repair — weekend sprint', 'Click-to-call only, max CPA guardrail at $85.', 'approved', day(14)],
      ['ad', 'meta', 'Lookalike — past customers', '1% lookalike seeded from won accounts.', 'awaiting_approval', day(18)],
      ['ad', 'youtube', 'Brand awareness bumper flight', '6-second bumpers, viewable CPM target.', 'approved', day(24)],
    ];
    for (const [kind, platform, title, copy, status, scheduledFor] of posts) {
      await prisma.socialPost.create({
        data: { orgId: org.id, kind, platform, title, copy, status, scheduledFor },
      });
    }

    // ── Call records (copilot) ──────────────────────
    const calls: [string, string, string, number, string, string, string, { who: string; text: string }[]][] = [
      [
        'Marla Whitfield', '(512) 555-0193', 'Dana Marsh', 252, 'ended', 'Warming',
        'Homeowner with storm damage on a 2011 architectural shingle roof. Insurance claim likely. Wants an inspection before the weekend; budget-conscious but approved by carrier. Recommended Thursday slot.',
        [
          { who: 'lead', text: 'Hi — we had hail last week and I just noticed a couple of dark spots on the ceiling upstairs.' },
          { who: 'rep', text: 'I am sorry to hear that — dark spots on the ceiling usually mean the deck is taking on water. How old is the roof?' },
          { who: 'lead', text: 'We bought in 2011 and I think it was replaced right before that. Does age matter for the claim?' },
          { who: 'rep', text: 'It matters for the payout, not the damage. With a roof that age, most carriers in Texas will total it on hail this size. Are you planning to file, or do you want us to look first?' },
          { who: 'lead', text: 'So would you be able to come out before the weekend? My adjuster wants photos from a roofer.' },
          { who: 'rep', text: 'Absolutely — I have Thursday at 9 or 2. We document everything the adjuster needs, and the inspection is free either way.' },
          { who: 'lead', text: 'Let us do Thursday at 9 then. And the roof — if they total it, what does that cost us out of pocket?' },
          { who: 'rep', text: 'Depends on your deductible — usually $1,000 to $2,500 on a policy like yours. I will bring the full breakdown Thursday.' },
        ],
      ],
      [
        'Derek Pham', '(512) 555-0177', 'Dana Marsh', 138, 'ended', 'Neutral',
        'Shopping three roofers for a full replacement. Price-anchored low by another bid. Sent the good-better-best breakdown and the Class 4 shingle upgrade sheet.',
        [
          { who: 'lead', text: 'I have two other quotes already — one is quite a bit lower than the range on your site.' },
          { who: 'rep', text: 'Happy to match scope line by line. Most of the time the low bid is re-decking excluded and synthetic underlayment swapped for felt.' },
          { who: 'lead', text: 'What does that matter, honestly?' },
          { who: 'rep', text: 'Felt wrinkles when it rains mid-job and the warranty stops at 20 years. Synthetic adds a day of install and doubles that. I will email the side-by-side so you can see exactly what changes.' },
        ],
      ],
      [
        'Rosa Delgado', '(512) 555-0144', 'Marcus Bell', 96, 'ended', 'Warming',
        'Repeat customer calling about a rental property. Wants the same crew as last year. Booked a Wednesday maintenance check.',
        [
          { who: 'lead', text: 'You did our house two years ago — the tenants at the other property say a few shingles lifted in the wind.' },
          { who: 'rep', text: 'We will take care of it. If it is just wind-lifted tabs it is a repair visit, not a replacement — we keep your color on file.' },
          { who: 'lead', text: 'Perfect, Wednesday works.' },
        ],
      ],
      [
        'Unknown caller', '(512) 555-0102', '—', 0, 'missed', '—',
        'Missed call, no voicemail. Number flagged once before — likely spam. Requeued for one callback attempt.',
        [],
      ],
      [
        'Trevor and Alyssa Kerr', '(512) 555-0160', 'Dana Marsh', 74, 'live', 'Warming',
        'Couple on the line together, first home, lots of questions about process. Currently on the call.',
        [
          { who: 'lead', text: 'First time dealing with any of this — the inspection, the quote, all of it. What actually happens Thursday?' },
          { who: 'rep', text: 'About 45 minutes on the roof and in the attic. Photos of everything, then a same-day writeup with the damage mapped.' },
        ],
      ],
    ];
    for (const [callerName, phone, repName, durationSec, status, sentiment, summary, transcript] of calls) {
      await prisma.callRecord.create({
        data: { orgId: org.id, callerName, phone, repName, durationSec, status, sentiment, summary, transcript, startedAt: new Date(now.getTime() - durationSec * 1000 - 1800 * 1000) },
      });
    }

    // ── Documents (brand wiki) ──────────────────────
    const docs: [string, string, string, string][] = [
      ['Brand guidelines v3', 'PDF', 'Primary palette, logo lockups, do-nots. The navy is retired — do not let it appear in any new creative.', '2.4 MB'],
      ['Pricing sheet — 2026', 'PDF', 'Full price book with ladder logic and floor margins per service line. Agent cites this on every quote draft.', '840 KB'],
      ['Tone of voice', 'DOCX', 'Plain, confident, never salesy. We say "replace" not "upgrade". Short sentences. No exclamation points.', '96 KB'],
      ['Warranty & maintenance terms', 'PDF', 'Workmanship warranty terms, what voids it, and the annual maintenance checklist homeowners sign.', '1.1 MB'],
      ['Service area map', 'PNG', 'Coverage radius with drive-time bands. Anything past band 3 needs a trip fee quoted up front.', '3.0 MB'],
      ['Sales FAQ — objections', 'TXT', 'Approved answers to the 12 most common objections, ranked by how often they come up on calls.', '14 KB'],
    ];
    for (const [title, category, content, size] of docs) {
      await prisma.document.create({
        data: { orgId: org.id, title, category, content, size, status: 'indexed' },
      });
    }

    // ── Proposal (for active client) ─────────────────
    if (cd.stage !== 'proposal_approved') {
      await prisma.proposal.create({
        data: {
          orgId: org.id,
          title: `${cd.name} — Website Build Proposal`,
          status: 'sent',
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
      email: 'demo@legacyforward.com',
      name: 'Demo User',
    },
  });

  console.log('Seed complete!');
  console.log('Demo pitch: /pitch/demo');
  console.log('Demo email: demo@legacyforward.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
