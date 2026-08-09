# RS e-tron GT Tracker

A single-file static site (`index.html`) tracking Stiles's search for a used 2024 Audi RS e-tron GT. Deployed to Netlify (site: `rs-etron-gt-tracker`, live at rs-etron-gt-tracker.netlify.app) via Netlify's Git integration — any push to `main` auto-deploys, no build step, no CI config needed.

The site is shared with dealership salespeople as a persistent link, so it should look clean and load fast on a phone. It was rebuilt mobile-first in August 2026 (card layout, collapsible criteria/excluded sections, sticky compact header) — preserve that pattern when editing; don't regress to a wide desktop table.

## What this project is

Daily automated search + a public tracker page, previously run inside Anthropic's "Cowork" product and migrated to a Claude Code Cloud Routine for independent, always-on scheduling and full local network access (Cowork's sandbox blocked Netlify's own API/CLI, which is part of why this moved).

## Target vehicle & hard requirements (non-negotiable)

2024 Audi RS e-tron GT (used).

1. **Black interior.**
2. **Ventilated/cooled front seats — confirmed via spec/equipment text, not assumed.** Ventilation only comes with the optional Full Leather Interior Package (~$4,500 new), showing up in listings as "Front Sport Seats Pro," "Full Leather Interior," or explicit "ventilation and massage function for front seats." A listing showing only "Heated Seats" does NOT qualify.
3. **Clean title — no Manufacturer Buyback/Lemon brand.** Non-negotiable regardless of price/condition. If a CARFAX or similar report shows a confirmed Buyback/Lemon brand, exclude outright. If contested/unconfirmed, keep tracked but flagged, don't exclude. A "good value" badge on a dealer/CARFAX page is about pricing, not title brand — not evidence of a clean title.
4. **Panoramic glass roof — confirmed, not assumed.** The RS trim has a no-cost factory choice between glass roof and carbon-fiber roof; check listed equipment text and window sticker photos. If unstated, mark "Needs verification," don't assume glass. Only exclude once carbon-fiber is actually confirmed. Note: this roof has no retractable shade (factory or otherwise) — heat-reflective glass only, already communicated to Stiles, no need to re-raise it.

## Preferences (flexible, priority order)

5. Lower mileage preferred.
6. TX, OK, LA, AR, NM preferred to minimize shipping — out-of-state listings meeting the hard requirements are still worth surfacing, with a rough shipping estimate.
7. Exterior color flexible (buyer is open to wrapping the car). Suzuka Gray Metallic, Daytona Gray Pearl Effect, and Black are bonus/nice-to-have, not required.

## Explicitly excluded

- Arras Red interior.
- Monaco Gray interior (unless separately confirmed acceptable — flag ambiguous cars for a call rather than excluding outright).
- Heated-only seats, no ventilation confirmation.
- Confirmed Manufacturer Buyback/Lemon branded title.
- Confirmed carbon-fiber roof instead of panoramic glass.
- Sold/delisted vehicles.

## Budget context (reference only, not something to act on)

Target all-in price: ~$63,000–$75,000. Target loan: ~$48,000. Trade-in offer $12,150, cash down ~$18,000. Financing: Capital One pre-approval at 7.4% APR is the floor to beat; applying at RBFCU; UFCU passed at 9%.

## Writing style for the tracker page

Keep card text terse — single words/short phrases ("Confirmed," "Needs verification," "Active," "Sold") rather than restating reasoning inline. Put genuinely useful reasoning in the small note line under a card, not repeated across every field.

## Data-quality lessons learned (apply these)

- Aggregator sites (Cars.com, CarGurus, Edmunds, KBB) have repeatedly shown wrong/mismatched interior colors, prices, and even VINs for the same car across different syndication sites. Prefer the dealer's own listing page or a directly-reviewed CARFAX/window-sticker over aggregator metadata.
- Many dealer sites are JavaScript-rendered and won't return real content to a plain fetch — a human browsing them sees real data that a simple HTTP fetch won't. Try a direct WebSearch for `<VIN> <dealer domain>` to find a working direct link before falling back to the dealer's general inventory page.
- Never fabricate or guess a listing URL. If no direct per-VIN page can be found, link to the dealer's general used-inventory search instead and say so.
- A branded-title claim from one source and a "clear title" claim from another for the same VIN have both turned out to be right in different cases — always prefer reading the actual CARFAX/history report over trusting either a dealer page's silence on the topic or a "good value" badge (which reflects pricing, not title brand).

## Deployment

- Netlify site is linked to this GitHub repo (`stiles-zenni/gt-tracker`, branch `main`) for continuous deployment — pushing `index.html` to `main` is the entire deploy process, no manual Netlify CLI/API calls needed.
- There is no separate build step. `index.html` is the full site: inline CSS, no JS framework, no external dependencies except system fonts.
- When iterating on layout/design, test locally by opening `index.html` directly in a browser (or `netlify dev` if you want live reload) before pushing — every push to `main` is a live deploy to the salesperson-facing URL.
