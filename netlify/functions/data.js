// Stable JSON export of the tracker's current state, derived live from the
// deployed index.html — not a hand-maintained duplicate file. Whoever
// consumes this (e.g. an external budget app) gets a contract that doesn't
// break when the UI gets redesigned, because this parser gets updated in
// the same commit as any markup change, not left to drift.
const SITE_URL = process.env.URL || "https://rs-etron-gt-tracker.netlify.app";

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function parseCard(block) {
  const id = (block.match(/data-id="([^"]+)"/) || [])[1] || null;
  const vin = (block.match(/data-vin="([^"]+)"/) || [])[1] || null;
  const dealerMatch = block.match(/<div class="dealer-link"><a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
  const dealer_name = dealerMatch ? dealerMatch[2] : null;
  const listing_url = dealerMatch ? dealerMatch[1] : null;
  const location = stripTags((block.match(/<div class="location">([\s\S]*?)<\/div>/) || [])[1] || "");
  const price = stripTags((block.match(/<div class="price[^"]*">([\s\S]*?)<\/div>/) || [])[1] || "");
  const spec_row = stripTags((block.match(/<div class="spec-row">([\s\S]*?)<\/div>/) || [])[1] || "");
  const phone_href = (block.match(/class="phone-link" href="tel:([^"]+)"/) || [])[1] || null;
  const days_on_market_text = stripTags((block.match(/<span class="dom">([\s\S]*?)<\/span>/) || [])[1] || "");
  const image = (block.match(/class="card-thumb" src="([^"]+)"/) || [])[1] || null;

  const tags = [];
  const tagRe = /<span class="tag ([^"]+)">([\s\S]*?)<\/span>/g;
  let tm;
  while ((tm = tagRe.exec(block)) !== null) {
    tags.push({ type: tm[1].replace("tag-", ""), label: stripTags(tm[2]) });
  }

  const statusMatch = block.match(/<div class="status-line ([^"]+)">([\s\S]*?)<\/div>/);
  const status = statusMatch ? { type: statusMatch[1].replace("status-", ""), label: stripTags(statusMatch[2]) } : null;

  const noteMatch = block.match(/<span class="note-text">([\s\S]*?)<\/span>/);
  const note = noteMatch ? stripTags(noteMatch[1]) : null;

  return {
    id, vin, dealer_name, listing_url, location, price, spec_row,
    phone: phone_href, days_on_market: days_on_market_text || null,
    image, tags, status, note,
  };
}

function parseExcludedItems(html) {
  const listMatch = html.match(/<div class="excluded-list">([\s\S]*?)<\/div>\s*<\/details>/);
  if (!listMatch) return [];
  const items = [];
  const itemRe = /<div class="excluded-item">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = itemRe.exec(listMatch[1])) !== null) {
    const text = stripTags(m[1]);
    const vinMatch = text.toUpperCase().match(/\b[A-Z0-9]{17}\b/);
    items.push({ text, vin: vinMatch ? vinMatch[0] : null });
  }
  return items;
}

exports.handler = async () => {
  try {
    const res = await fetch(`${SITE_URL}/index.html`);
    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: "Could not fetch index.html" }) };
    }
    const html = await res.text();

    const updatedMatch = html.match(/<div class="updated">([\s\S]*?)<\/div>/);
    const updated_label = updatedMatch ? stripTags(updatedMatch[1]) : null;

    const cardBlocks = html.match(/<div class="card" data-id="[^"]+"[\s\S]*?\n {4}<\/div>/g) || [];
    const tracked = cardBlocks.map(parseCard);
    const excluded = parseExcludedItems(html);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      body: JSON.stringify({ updated_label, tracked, excluded }, null, 2),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Failed to parse tracker data", detail: String(err) }) };
  }
};
