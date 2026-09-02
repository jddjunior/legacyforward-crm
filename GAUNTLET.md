# Gauntlet Loop — Customer CRM/CDP Portal

Mode: **Both** — degraded in-context run (no sub-agent fan-out in this environment; the
background verifier stands in as a partial blind critic, since it inspects the rendered
artifact with no memory of the build) **plus** the paste-ready prompt at the bottom for a
real fan-out in Claude Code.

## The bar

**Linear.** Not its trade dress — its level of craft:

1. **Density.** More real rows per screen. Dividers, not card gaps. No decorative padding.
2. **Calm.** Near-monochrome neutrals. Color carries status or action, never mood.
3. **Typographic hierarchy.** Few sizes, tight labels, no 32px display numbers.
4. **Instant state.** Changes land immediately; motion only where it explains a transition.
5. **Keyboard-first.** ⌘K palette, arrow + Enter, visible shortcut hints.

Restated verbatim in every critic pass. Bars are compared against, not copied.

## Constraints

- Hold brand hues: `#335aea` primary, `#ffc400` reserved for active/attention only, Geist.
- Free rein on neutrals, spacing, radii, and chrome.
- One DC file. All 16 nav routes survive.
- Gateway is hard: no CRM access before proposal → payment → access → setup.

## Pieces in the gauntlet

| # | Piece | Rounds | Verdict | Current gap |
| - | ----- | ------ | ------- | ----------- |
| 1 | Access gateway (pitch → pay → setup) | 1 | building | — |
| 2 | Dashboard at-a-glance | 1 | building | — |
| 3 | Approvals review flow | 1 | building | — |
| 4 | Leads & Customers tables | 1 | building | — |
| 5 | Socials / Ads calendar | 1 | building | — |
| 6 | Documents wiki | 1 | building | — |
| 7 | Onboarding wizard | 1 | building | — |
| 8 | Typography & color system | 1 | building | — |

Budget: short — 2 rounds per piece. The user is the brake.

## Round log

- **R1** — v2 built against the bar: gateway added, cards stripped to dense
  lists/tables, near-monochrome neutrals, status as dot + text instead of filled pills,
  ⌘K command palette, master-detail Approvals and Documents, denser calendar.

---

## Mode A — paste this into Claude Code (fresh session, sub-agents on)

> Build a customer CRM/CDP portal for a full-stack marketing agency's clients. The
> quality bar is **Linear** — match its level of craft, not its look: density, calm
> near-monochrome color, few type sizes, instant state, keyboard-first navigation. Do not
> copy its assets, names, or copy.
>
> Hard requirements: the website pitch is the gateway into the product — the client
> reviews the website build we produced, approves it, pays (Stripe), creates portal
> access, then completes setup (brand + data uploads, tech selection, service
> connections, review pulling) before any CRM route unlocks. After unlock: Dashboard,
> Approvals, Leads, Customers, Pipeline (draggable), Reviews, Website, SEO, Socials
> (scheduled-post calendar), Ads (flight calendar), Services (full CRUD with
> price/cost/margin), Media (labeled photo + video buckets), Documents (searchable wiki
> for agent retrieval), Connections, Profile, Settings.
>
> Hold these brand tokens: #335aea primary, #ffc400 for active/attention only, Geist type.
> Neutrals and spacing are yours.
>
> Work as a Gauntlet Loop. Split this into independently judgeable pieces — gateway,
> dashboard, approvals flow, tables, calendars, wiki, setup wizard, type/color system.
> For each piece spawn a **builder** sub-agent and a separate **critic** sub-agent with a
> fresh context and no memory of the build. The critic must inspect the real rendered
> output (run it, screenshot it), compare it against Linear as stated above, and return:
> a verdict (does ours win or does the bar), and **one** gap — the single largest
> remaining difference, concrete enough to act on. Feed that one gap back to the builder,
> rebuild, re-judge. Two rounds per piece minimum.
>
> Keep a workbench file with piece / round / verdict / current gap and update it every
> round. Escalate to me if the same gap survives three rounds or verdicts oscillate. I
> decide when to stop.
