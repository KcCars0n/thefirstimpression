import { list } from "@vercel/blob";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    const result = await list({ prefix: "faces/", limit: 1000 });
    const urls = (result.blobs || []).map(b => b.url);
    res.status(200).json({ ok: true, count: urls.length, urls });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
