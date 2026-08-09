# Daily search routine

This is the prompt to paste into the Claude Code Cloud Routine (`/schedule`), pointed at the `stiles-zenni/gt-tracker` repo. Run daily.

---

You are running the daily search for Stiles's 2024 Audi RS e-tron GT purchase. This is a recurring routine — you have no memory of prior runs beyond what's in this repo.

**First, read `CLAUDE.md` in this repo.** It has the full hard requirements, exclusions, budget context, writing-style rules, and data-quality lessons learned from past runs. Follow it exactly — don't re-derive or second-guess the screening criteria, they're deliberate.

## Netlify deploy budget is scarce — deploy sparingly

Netlify free-plan deploys are metered (roughly 20 total before hitting a wall, last checked). Editing `index.html` locally in the repo costs nothing. Committing and pushing to `main` triggers a live Netlify deploy and is NOT free — reserve it for changes that actually matter to a purchase decision. Editing the file and deploying it are two separate decisions with very different bars.

## Steps

1. Read `index.html` for the current tracked listings, criteria, and links.
2. Re-check each tracked VIN's status via web search (and fetching the dealer listing URL where available): active, sold/delisted, or price changed. A 404 or "no longer available" language is a strong sold signal — say so, don't assert certainty unless explicitly confirmed.
3. Search for new 2024 RS e-tron GT listings meeting all hard requirements from `CLAUDE.md`, prioritizing TX/nearby states. Use Cars.com, CarGurus, Edmunds, KBB, and individual dealer sites.
4. Flag anything ambiguous (interior color, ventilation, title, roof) rather than silently excluding or silently clearing it — see `CLAUDE.md` for which flags are hard-exclude vs. needs-verification.
5. For any new qualifying listing, find and preserve a direct link to the vehicle's own product page (not an aggregator/search-results page). Try a web search for the VIN plus the dealer's domain. If no direct page can be found after a reasonable attempt, link to the dealer's general used-inventory page instead and say so — never fabricate a URL.
6. If there's ANY change (new listing, price move, status change, link fix, a flag resolved, etc.), edit `index.html` directly to reflect it — keep the existing mobile-first card layout and structure, don't rebuild it from scratch each time. Keep cell/tag text terse per `CLAUDE.md`'s writing-style section.
7. Decide separately whether this change clears the bar for an actual deploy. Only commit and push to `main` if at least one of these is true:
   - A new listing was found meeting all hard requirements.
   - A tracked VIN's status changed in a way that affects viability (active → sold/delisted, a red flag confirmed or resolved, a previously-disqualifying issue cleared).
   - A price change of $1,000+ on a tracked, currently-viable VIN.
   Otherwise, leave the local edit uncommitted/unpushed — or if you're working in a persistent clone, commit locally for your own tracking but don't push. When in doubt, don't spend the deploy.
8. If you do push: pushing to `main` is the entire deploy process — Netlify's Git integration handles the rest automatically. No Netlify CLI or API call needed.
9. Report back concisely: what changed, whether it was published live and why (or why it wasn't, so nothing feels silently dropped), or a one-line "checked, no changes" if nothing moved.

## Guardrails

- Search/monitoring only — do not contact a dealer, submit a form, or take any purchase/payment action.
- If a VIN's data starts contradicting itself across sources (wrong model year, wildly different price/history), flag it explicitly as unreliable and recommend a phone call — treat this as a status change that clears the deploy bar.
