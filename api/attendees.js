/* Vercel serverless function: pull the attendee roster from a Sport Paddy game page.
 *
 *   GET /api/attendees?url=https://sportpaddy.com/game/<slug>/players
 *   GET /api/attendees?slug=<slug>
 *
 * Returns: { ok, slug, date, count, players: [...] }
 * Only sportpaddy.com URLs are allowed (no open proxy).
 */

const HOST = "sportpaddy.com";

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, function (_, h) { return String.fromCodePoint(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (_, d) { return String.fromCodePoint(parseInt(d, 10)); });
}

function parsePlayers(html) {
  const found = [];
  const seen = new Set();
  function add(raw) {
    const name = decodeEntities(raw).replace(/\s+/g, " ").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    found.push(name);
  }
  // Rendered HTML: <span class="mt-2 font-semibold text-ink">NAME</span>
  const re = /class="mt-2 font-semibold text-ink"[^>]*>([^<]+)</g;
  let m;
  while ((m = re.exec(html))) add(m[1]);
  // Fallback: the RSC streaming payload
  if (!found.length) {
    const re2 = /"className":"mt-2 font-semibold text-ink","children":"((?:[^"\\]|\\.)*)"/g;
    while ((m = re2.exec(html))) add(m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
  }
  return found;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const q = req.query || {};
  let target;
  try {
    if (q.url) {
      target = new URL(q.url);
    } else if (q.slug) {
      target = new URL("https://" + HOST + "/game/" + encodeURIComponent(q.slug) + "/players");
    } else {
      return res.status(400).json({ ok: false, error: "Pass ?url= or ?slug=" });
    }
  } catch (e) {
    return res.status(400).json({ ok: false, error: "Invalid URL" });
  }

  if (target.hostname !== HOST && target.hostname !== "www." + HOST) {
    return res.status(400).json({ ok: false, error: "Only " + HOST + " URLs are allowed" });
  }
  if (!/\/game\/[^/]+/.test(target.pathname)) {
    return res.status(400).json({ ok: false, error: "Not a Sport Paddy game URL" });
  }
  if (!target.pathname.endsWith("/players")) {
    target.pathname = target.pathname.replace(/\/$/, "") + "/players";
  }

  const gameSlug = (target.pathname.match(/\/game\/([^/]+)/) || [])[1] || "";
  const dateMatch = gameSlug.match(/(\d{4}-\d{2}-\d{2})/);

  let html;
  try {
    const r = await fetch(target.toString(), {
      headers: { "User-Agent": "WBFC-stats/1.0 (+https://wbfc.vercel.app)" },
    });
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: "Sport Paddy returned " + r.status });
    }
    html = await r.text();
  } catch (e) {
    return res.status(502).json({ ok: false, error: "Could not reach Sport Paddy" });
  }

  const players = parsePlayers(html);
  return res.status(200).json({
    ok: true,
    slug: gameSlug,
    date: dateMatch ? dateMatch[1] : null,
    count: players.length,
    players: players,
  });
};
