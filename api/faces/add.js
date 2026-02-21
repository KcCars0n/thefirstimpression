import { put } from "@vercel/blob";

export const config = { runtime: "nodejs" };

function clampCount(n) {
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(50, Math.floor(n))); // max 50 per click
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const count = clampCount(Number(url.searchParams.get("count")));

    // Ask RandomUser for `count` people
    const peopleRes = await fetch(`https://randomuser.me/api/?results=${count}&nat=us,ca,gb,au`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!peopleRes.ok) throw new Error(`RandomUser fetch failed: ${peopleRes.status}`);
    const peopleJson = await peopleRes.json();
    const results = peopleJson.results || [];

    const saved = [];

    for (const p of results) {
      // Choose large portrait (higher quality)
      const imgUrl = p?.picture?.large;
      if (!imgUrl) continue;

      const imgRes = await fetch(imgUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!imgRes.ok) continue;

      const buf = Buffer.from(await imgRes.arrayBuffer());

      // quick quality gate
      if (buf.length < 20_000) continue;

      const key = `faces/${crypto.randomUUID()}.jpg`;
      const blob = await put(key, buf, {
        access: "public",
        contentType: "image/jpeg"
      });

      saved.push(blob.url);
    }

    res.status(200).json({ ok: true, requested: count, count: saved.length, urls: saved });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
