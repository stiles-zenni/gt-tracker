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
- Never fabricate or guess a listing URL. If no direct per-VIN page can be found, link to the dealer's general used-inventory search instead and say so — but also try the VIN on Cars.com/CarGurus first; a specific aggregator vehicle-detail page (VDP) for that VIN is still much better than a generic dealer inventory search, and is often findable even when the dealer's own site has no working per-vehicle URL.
- A branded-title claim from one source and a "clear title" claim from another for the same VIN have both turned out to be right in different cases — always prefer reading the actual CARFAX/history report over trusting either a dealer page's silence on the topic or a "good value" badge (which reflects pricing, not title brand).
- For every tracked/new listing, also grab a thumbnail: use the first/main photo from the listing's own gallery (not a dealership logo or a financing banner), download it into the `images/` folder with a short `dealer-city.jpg`-style filename, and reference it locally in `index.html` (`<img class="card-thumb" src="images/...">`) — don't hotlink the dealer's own image URL directly, since many are signed/expiring or block hotlinking from other domains. If no clean photo can be found for a listing, omit the `<img class="card-thumb">` tag entirely rather than leave a broken image.
- **Visor (MCP connector, `visor.vin`) is the primary data source going forward** — structured listing search, VIN lookup, and dealer data instead of scraping. It resolved a real price/mileage conflict and surfaced a previously-missed qualifying listing (Group 1 Ford of Rockwall) on first use. It does NOT cover every dealer (confirmed gap: Driven Auto of Waukegan isn't in its feed) — fall back to WebSearch/WebFetch for anything Visor doesn't return. Its `options` array is useful for hard-requirement checks (`9EF` = Full Leather Interior → ventilation, `3FG` = Panoramic Fixed Glass Roof) but can be incomplete for a given listing — treat a missing option code as "needs verification," not as disconfirming, and prefer the dealer's own page when the two disagree (this is what caught Select Auto Imports' heated-only-seats contradiction).

## Deployment

- Netlify site is linked to this GitHub repo (`stiles-zenni/gt-tracker`, branch `main`) for continuous deployment — pushing `index.html` to `main` is the entire deploy process, no manual Netlify CLI/API calls needed.
- There is no build step for the site itself. `index.html` is the full site: inline CSS, no JS framework, no external dependencies except system fonts.
- When iterating on layout/design, test locally by opening `index.html` directly in a browser (or `netlify dev` if you want live reload) before pushing — every push to `main` is a live deploy to the salesperson-facing URL.
- One small piece of CI does exist: `.github/workflows/merge-claude-branches.yml`. The Claude Code Cloud Routine that runs `ROUTINE.md` daily cannot push straight to `main` — Anthropic's cloud platform redirects its pushes to a `claude/*` branch as a safety default, regardless of what the routine's own prompt says. This workflow fast-forwards `main` to match the instant one of those branches appears, so the routine still ends up fully unattended end-to-end. It doesn't build or compile anything — it only merges.
- The site also has two serverless functions, both using the same `GT_TRACKER_GITHUB_TOKEN` env var (a fine-grained PAT, Contents read/write, scoped to just this repo) to commit straight to `main` via the GitHub API — no login gate on the page itself, anyone with the link can use either, by deliberate choice given this is a low-stakes personal tool:
  - `netlify/functions/update-listing.js` backs the ✎ edit icon next to each dealer link. Takes a pasted URL (+ optional image URL), tries to pull an `og:image` from the new page server-side, and commits the updated link/photo.
  - `netlify/functions/exclude-listing.js` backs the ✕ exclude icon next to each dealer link. Takes an optional reason, removes that card from "Tracked listings," adds it to "Excluded / disqualified" with the reason, and updates both counts (plus the header's "N tracked").
  `index.html` is still hand-edited HTML with a `data-id` per card (matching each card's image filename stem) — both functions do a targeted string replace/removal on that one card's block, not a full rewrite. Keep the `data-id` and the ✎/✕ button pair on every card, including ones added by the daily routine.
