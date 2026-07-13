import { BGEO } from "../config/endpoints.js";

// BGeometrics (bitcoin-data.com) — free, keyless, browser-CORS enabled, but with
// STRICT rate limits. These are daily metrics, so they are fetched on their own
// hourly cadence (never the 120s loop) and cached in localStorage for 24h so a
// rate-limited session still shows the last-known value.

const day = ms => new Date(ms).toISOString().slice(0, 10);
const DAY_MS = 86400000;

const cacheGet = (k, maxAge) => {
  try { const o = JSON.parse(localStorage.getItem(k)); if (o && Date.now() - o.ts < maxAge) return o.v; } catch { /* ignore */ }
  return null;
};
const cacheSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify({ v, ts: Date.now() })); } catch { /* ignore */ } };

// 7d-smoothed SOPR from the last ~2 weeks of daily values.
export async function fetchSopr() {
  try {
    const end = Date.now(), start = end - 15 * DAY_MS;
    const r = await fetch(`${BGEO}/sopr?startday=${day(start)}&endday=${day(end)}`);
    if (!r.ok) throw new Error(`http ${r.status}`);
    const d = await r.json();
    const vals = (Array.isArray(d) ? d : []).map(x => parseFloat(x.sopr)).filter(v => !isNaN(v));
    if (!vals.length) throw new Error("empty");
    const last7 = vals.slice(-7);
    const out = { sopr7d: last7.reduce((s, v) => s + v, 0) / last7.length, latest: vals[vals.length - 1] };
    cacheSet("bgeo_sopr", out);
    return out;
  } catch { return cacheGet("bgeo_sopr", DAY_MS); }
}

// Puell Multiple — miner revenue vs its 365d average (Tier 2, late-cycle stress).
export async function fetchPuell() {
  try {
    const r = await fetch(`${BGEO}/puell-multiple/last`);
    if (!r.ok) throw new Error(`http ${r.status}`);
    const d = await r.json();
    const v = parseFloat(d?.puellMultiple);
    if (isNaN(v)) throw new Error("nan");
    cacheSet("bgeo_puell", v);
    return v;
  } catch { return cacheGet("bgeo_puell", DAY_MS); }
}
