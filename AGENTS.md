# AGENTS.md

## What this project is

A set of self-contained DC (Design Context) HTML prototype files for a multi-tenant CRM/CDP portal ("LegacyForward CRM"). There is no backend — `BACKEND.md` describes what the backend *should* be, and `GAUNTLET.md` is a design-quality loop spec.

## How it runs

- The `.dc.html` files are standalone HTML pages. Each loads `support.js`, which bootstraps React 18.3.1 + Babel from unpkg CDN, parses the `<x-dc>` template block, and renders it with React.
- Served as static files via `nginx:alpine` in `docker-compose.base44.yml` on port 3000.
- `index.html` at the root links to every portal version. "Customer Portal v4.dc.html" is the latest.

## File layout

| File | Purpose |
|------|---------|
| `*.dc.html` | Portal prototypes (Agency Portal, Customer Portal v1–v4) |
| `support.js` | DC runtime — parses and renders DC templates with React |
| `BACKEND.md` | Backend requirements spec (not yet implemented) |
| `GAUNTLET.md` | Design-quality evaluation loop spec |
| `uploads/` | Pasted images referenced by prototypes |

## Editing a portal

Edit the `.dc.html` file directly — it hot-reloads on refresh (nginx serves the file live). The DC templating syntax uses `{{ bindings }}`, `<sc-for>`, `<sc-if>`, and `style-hover` attributes. No build step.

## No secrets needed

All external resources (React, Babel) load from public CDNs at runtime. No API keys or credentials are required.
