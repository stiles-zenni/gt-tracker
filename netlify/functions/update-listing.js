// Updates one tracked listing's link (and photo) directly in index.html on
// main, using a GitHub token stored as the GT_TRACKER_GITHUB_TOKEN Netlify
// env var. Triggered by the edit-icon modal in index.html.
const GITHUB_TOKEN = process.env.GT_TRACKER_GITHUB_TOKEN;
const REPO = "stiles-zenni/gt-tracker";
const BRANCH = "main";
const GITHUB_API = "https://api.github.com";

function ghHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "gt-tracker-update-listing",
  };
}

async function findOgImage(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; gt-tracker-bot/1.0)" },
    });
    const html = await res.text();
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
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

  const { id, newUrl, manualImageUrl } = payload;
  if (!id || !newUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: "id and newUrl are required" }) };
  }
  try {
    new URL(newUrl);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "newUrl is not a valid URL" }) };
  }

  // 1. Resolve an image: manual override wins, else try og:image on the new page.
  let imageUrl = manualImageUrl || (await findOgImage(newUrl));

  let imagePath = null;
  let imageBase64 = null;
  if (imageUrl) {
    try {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer());
        const extMatch = imageUrl.split("?")[0].match(/\.(jpg|jpeg|png|webp)$/i);
        const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
        imagePath = `images/${id}.${ext}`;
        imageBase64 = buf.toString("base64");
      }
    } catch {
      // Couldn't fetch the image — proceed without touching the thumbnail.
      imagePath = null;
      imageBase64 = null;
    }
  }

  // 2. Read current index.html
  const fileRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/index.html?ref=${BRANCH}`, {
    headers: ghHeaders(),
  });
  if (!fileRes.ok) {
    return { statusCode: 502, body: JSON.stringify({ error: "Could not read index.html from GitHub" }) };
  }
  const fileData = await fileRes.json();
  const currentHtml = Buffer.from(fileData.content, "base64").toString("utf-8");

  // 3. Locate the specific card by data-id and patch its href (+ img src if we have a new image).
  const cardRegex = new RegExp(
    `(<div class="card" data-id="${id}">[\\s\\S]*?\\n    </div>)`
  );
  const cardMatch = currentHtml.match(cardRegex);
  if (!cardMatch) {
    return { statusCode: 404, body: JSON.stringify({ error: `No card found with id "${id}"` }) };
  }
  let updatedBlock = cardMatch[1].replace(
    /href="[^"]*"(\s+target="_blank")/,
    `href="${newUrl}"$1`
  );
  if (imagePath) {
    updatedBlock = updatedBlock.replace(/src="images\/[^"]*"/, `src="${imagePath}"`);
  }
  const updatedHtml = currentHtml.replace(cardMatch[1], updatedBlock);

  // 4. Commit index.html
  const commitRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/index.html`, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify({
      message: `Update listing link${imagePath ? " and photo" : ""} for ${id} (via UI)`,
      content: Buffer.from(updatedHtml, "utf-8").toString("base64"),
      sha: fileData.sha,
      branch: BRANCH,
    }),
  });
  if (!commitRes.ok) {
    const detail = await commitRes.text();
    return { statusCode: 502, body: JSON.stringify({ error: "Failed to commit index.html", detail }) };
  }

  // 5. Commit the new image, if we resolved one.
  if (imagePath && imageBase64) {
    let existingSha;
    const existingRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${imagePath}?ref=${BRANCH}`, {
      headers: ghHeaders(),
    });
    if (existingRes.ok) {
      existingSha = (await existingRes.json()).sha;
    }
    await fetch(`${GITHUB_API}/repos/${REPO}/contents/${imagePath}`, {
      method: "PUT",
      headers: ghHeaders(),
      body: JSON.stringify({
        message: `Update photo for ${id} (via UI)`,
        content: imageBase64,
        branch: BRANCH,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, imageUpdated: Boolean(imagePath) }),
  };
};
