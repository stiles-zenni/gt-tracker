// Read-only "what's on the market right now" check against Visor, for the
// header's Check now button. Deliberately unscreened — no ventilation/roof/
// title logic here, that stays in the daily routine. Uses VISOR_API_KEY
// (a Visor REST API key, separate from the account's MCP OAuth connection).
const VISOR_API_KEY = process.env.VISOR_API_KEY;
const VISOR_API = "https://api.visor.vin/v1/listings";

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!VISOR_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server missing VISOR_API_KEY" }) };
  }

  const params = new URLSearchParams({
    make: "Audi",
    model: "RS e-tron GT",
    year: "2024",
    sort: "-listed_at",
    limit: "20",
    fields: "vin,price,miles,dealer_name,city,state,days_on_market,listed_at,exterior_color,interior_color,vdp_url",
  });

  try {
    const res = await fetch(`${VISOR_API}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${VISOR_API_KEY}` },
    });
    if (!res.ok) {
      const detail = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: "Visor request failed", detail }) };
    }
    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ listings: data.data || [], total: data.pagination ? data.pagination.total : null }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Could not reach Visor", detail: String(err) }) };
  }
};
