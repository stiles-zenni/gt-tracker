// Moves one tracked listing to the excluded list directly in index.html on
// main, using the same GT_TRACKER_GITHUB_TOKEN env var as update-listing.js.
// Triggered by the exclude-icon modal in index.html.
const GITHUB_TOKEN = process.env.GT_TRACKER_GITHUB_TOKEN;
const REPO = "stiles-zenni/gt-tracker";
const BRANCH = "main";
const GITHUB_API = "https://api.github.com";

function ghHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "gt-tracker-exclude-listing",
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server missing GT_TRACKER_GITHUB_TOKEN" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }
  const { id, reason } = payload;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: "id is required" }) };
  }
  const reasonText = reason && reason.trim() ? reason.trim() : "Manually excluded";

  const fileRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/index.html?ref=${BRANCH}`, {
    headers: ghHeaders(),
  });
  if (!fileRes.ok) {
    return { statusCode: 502, body: JSON.stringify({ error: "Could not read index.html from GitHub" }) };
  }
  const fileData = await fileRes.json();
  const currentHtml = Buffer.from(fileData.content, "base64").toString("utf-8");

  const cardRegex = new RegExp(`\\s*<div class="card" data-id="${id}">[\\s\\S]*?\\n    </div>\\n`);
  const cardMatch = currentHtml.match(cardRegex);
  if (!cardMatch) {
    return { statusCode: 404, body: JSON.stringify({ error: `No card found with id "${id}"` }) };
  }
  const cardBlock = cardMatch[0];

  const dealerMatch = cardBlock.match(/<div class="dealer-link"><a[^>]*>([^<]+)<\/a>/);
  const locationMatch = cardBlock.match(/<div class="location">([^<]+)<\/div>/);
  const dealerName = dealerMatch ? dealerMatch[1] : "Unknown dealer";
  const location = locationMatch ? locationMatch[1] : "Unknown location";

  // Remove the card, keeping a single blank-line gap between the neighbors it leaves behind.
  let updatedHtml = currentHtml.replace(cardBlock, "\n\n");

  updatedHtml = updatedHtml.replace(/Tracked listings \((\d+)\)/, (m, n) => `Tracked listings (${parseInt(n, 10) - 1})`);
  updatedHtml = updatedHtml.replace(/(\d+) tracked/, (m, n) => `${parseInt(n, 10) - 1} tracked`);
  updatedHtml = updatedHtml.replace(/Excluded \/ disqualified \((\d+)\)/, (m, n) => `Excluded / disqualified (${parseInt(n, 10) + 1})`);

  const newItem = `      <div class="excluded-item"><strong>${location}</strong> — ${dealerName}, ${reasonText}</div>\n`;
  updatedHtml = updatedHtml.replace(/(<div class="excluded-list">\n)/, `$1${newItem}`);

  const commitRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/index.html`, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify({
      message: `Exclude ${dealerName} (${location}) via UI: ${reasonText}`,
      content: Buffer.from(updatedHtml, "utf-8").toString("base64"),
      sha: fileData.sha,
      branch: BRANCH,
    }),
  });
  if (!commitRes.ok) {
    const detail = await commitRes.text();
    return { statusCode: 502, body: JSON.stringify({ error: "Failed to commit index.html", detail }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, dealerName, location }) };
};
