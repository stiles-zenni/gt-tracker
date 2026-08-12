# RS e-tron GT Tracker

A single-file static site (`index.html`) tracking Stiles's search for a used 2024 Audi RS e-tron GT. Deployed to Netlify (site: `rs-etron-gt-tracker`, live at rs-etron-gt-tracker.netlify.app) via Netlify's Git integration — any push to `main` auto-deploys, no build step, no CI config needed.

The site is shared with dealership salespeople as a persistent link, so it should look clean and load fast on a phone. It was rebuilt mobile-first in August 2026 (card layout, collapsible criteria/excluded sections, sticky compact header) — preserve that pattern when editing; don't regress to a wide desktop table.

## What this project is

Daily automated search + a public tracker page, previously run inside Anthropic's "Cowork" product and migrated to a Claude Code Cloud Routine for independent, always-on scheduling and full local network access (Cowork's sandbox blocked Netlify's own API/CLI, which is part of why this moved).

## Target vehicle & hard requirements (non-negotiable)

2024 Audi RS e-tron GT (used).

1. **Interior color tier — determines which tracker section a listing goes in, not a pass/fail gate:**
   - **Perfect Fit**: black interior.
   - **Alternates**: Monaco Gray or Santos Brown interior. Acceptable because Stiles plans to fully wrap the exterior of any car that isn't Suzuka Gray or Black anyway, and can pick a wrap color that complements either of these interior tones. Track these normally, just in the Alternates section of `index.html` instead of Perfect Fit.
   - Arras Red interior remains excluded outright (not part of this tiering — see Explicitly excluded below).
   - Any other interior color not covered above: flag for a call rather than silently excluding or silently tracking, same as always.
2. **Ventilated/cooled front seats — confirmed via spec/equipment text, not assumed.** Ventilation only comes with the optional Full Leather Interior Package (~$4,500 new) — confirmed across multiple real window stickers plus a general web search, no known exception or standalone alternate path to ventilation. **Confirming the package itself is sufficient on its own — you don't need the word "ventilated" to appear anywhere.** Look for any of: the package named directly ("Full Leather Interior Package," "Full Leather Interior"), Visor's option code `9EF`, or its bundled seat name "Front Sport Seats Pro" / "RS Sport Seats Plus." A listing showing only "Heated Seats" with none of the above does NOT qualify — some northern-climate dealers write "heated" loosely/generically even when the car has the fuller package, so absence of the word "ventilated" in prose is not itself disqualifying either; check for the package, not the word.
3. **Clean title — no Manufacturer Buyback/Lemon brand.** Non-negotiable regardless of price/condition. If a CARFAX or similar report shows a confirmed Buyback/Lemon brand, exclude outright. If contested/unconfirmed, keep tracked but flagged, don't exclude. A "good value" badge on a dealer/CARFAX page is about pricing, not title brand — not evidence of a clean title.
4. **Panoramic glass roof — confirmed, not assumed.** The RS trim has a no-cost factory choice between glass roof and carbon-fiber roof.
   - **Window sticker photos are the most authoritative source and are usually easy to find** — dealers commonly post the sticker as one of the first few gallery photos (often #2, right after the main exterior shot), not buried deep. Check the first 5–10 gallery photos for one before falling back to equipment text alone.
   - **On the sticker, roof status is its own distinct line item** under Packages/Options — look specifically for "Panoramic Fixed Glass Roof: Included" (or similar). Read that line directly; don't infer roof status from a package *name* alone. Correction from an earlier version of this file: a **"Carbon Performance Package" name does NOT by itself mean carbon roof** — on at least one confirmed sticker, that package was carbon-fiber door sills/trim only, with the glass roof confirmed separately on its own line in the same package column. Always find the explicit roof line before concluding carbon.
   - Interior gallery photos are a good secondary check — a glass panel visibly transmits light/sky from inside the cabin; carbon fiber is opaque.
   - This model has no third "regular small sunroof" option — it's strictly glass-panoramic or carbon-fiber — so generic aggregator/dealer terms like "Sunroof" or "Moonroof" (without further detail) count as a positive signal for the glass roof, not an unknown.
   - Only treat it as carbon and exclude once you've found an explicit carbon-roof line (e.g. "Carbon Fiber Roof: Included") or a photo showing an opaque headliner with no glass panel anywhere. If truly nothing roof-related is found after checking the sticker and photos, mark "Needs verification," don't assume glass.
   - Note: this roof has no retractable shade (factory or otherwise) — heat-reflective glass only, already communicated to Stiles, no need to re-raise it.
5. **No significant structural/frame damage — confirmed via the actual pulled CARFAX/AutoCheck report, not a dealer-page snapshot badge.** Snapshot/summary "Structural Damage Reported" badges are known to sometimes trigger on minor items (a bumper/fascia repair, a post-repair sensor recalibration) that aren't real frame/unibody damage — treat a badge alone as "needs verification," not confirmed. Only exclude once the full report is actually read and confirms genuine structural/frame damage. Mirrors how title-brand claims are handled below.

## Preferences (flexible, priority order)

6. Lower mileage preferred.
7. TX, OK, LA, AR, NM preferred to minimize shipping — out-of-state listings meeting the hard requirements are still worth surfacing, with a rough shipping estimate.
8. Exterior color flexible (buyer is open to wrapping the car). Suzuka Gray Metallic, Daytona Gray Pearl Effect, and Black are bonus/nice-to-have, not required.

## Explicitly excluded

- Arras Red interior.
- Heated-only seats, no ventilation confirmation.
- Confirmed Manufacturer Buyback/Lemon branded title.
- Confirmed carbon-fiber roof instead of panoramic glass.
- Confirmed significant structural/frame damage (from the actual report, not a snapshot badge).
- Sold/delisted vehicles.

## Budget context (reference only, not something to act on)

Target all-in price: ~$63,000–$75,000. Target loan: ~$48,000. Trade-in offer $12,150, cash down ~$18,000. Financing: Capital One pre-approval at 7.4% APR is the floor to beat; applying at RBFCU; UFCU passed at 9%.

## Writing style for the tracker page

Keep card text terse — single words/short phrases ("Confirmed," "Needs verification," "Active," "Sold") rather than restating reasoning inline. Put genuinely useful reasoning in the small note line under a card, not repeated across every field.

Every tracked card's `spec-row` must show the VIN, no exceptions — the salesperson needs it to look up the specific car. Don't drop it for space; it's the one field that can't be terse-out.

Tracked listings are split into two `.listings` blocks under separate `.section-label`s: **Perfect Fit** (black interior) and **Alternates** (Monaco Gray / Santos Brown interior), each with its own `(N)` count in the label — see requirement #1. A given car only ever belongs in one of the two; move it between sections if new info changes its interior-color read. Keep both sections' counts and the header's overall "N tracked" total in sync when adding/removing a card.

## Data-quality lessons learned (apply these)

- Aggregator sites (Cars.com, CarGurus, Edmunds, KBB) have repeatedly shown wrong/mismatched interior colors, prices, and even VINs for the same car across different syndication sites. Prefer the dealer's own listing page or a directly-reviewed CARFAX/window-sticker over aggregator metadata.
- When Visor and a dealer's own site disagree on active vs. sold/delisted, trust the dealer's own site. Visor only reflects a delisting once it re-crawls, so its `status`/`last_checked_at` can run a day or more stale — it's a great discovery/breadth tool, not a real-time source of truth for whether one specific tracked car is still available. If a dealer's VDP URL now redirects to their generic inventory page (or 404s), treat that as confirmed sold/delisted even if Visor still shows the VIN active.
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
