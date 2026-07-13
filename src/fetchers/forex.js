import { FRANKF, COINAPI } from "../config/endpoints.js";
import { DXY_BASKET, computeDxy } from "../lib/dxy.js";

// KEYLESS DXY (Frankfurter / ECB, v1 API on the .dev domain) — { dxy, rates } or null.
export async function fetchKeylessDxy() {
  try {
    const r = await fetch(`${FRANKF}/latest?base=USD&symbols=EUR,JPY,GBP,CAD,SEK,CHF`);
    if (!r.ok) return null;
    const d = await r.json();
    if (!d.rates) return null;
    const dxy = computeDxy(d.rates);
    return dxy != null ? { dxy, rates: d.rates } : null;
  } catch { return null; }
}

// CoinAPI real-time forex (optional key) — returns { dxy, rates } or null.
export async function fetchCoinApiDxy(apiKey) {
  if (!apiKey?.trim()) return null;
  const rates = {};
  await Promise.allSettled(DXY_BASKET.map(async ({ id }) => {
    try {
      const r = await fetch(`${COINAPI}/exchangerate/USD/${id}`, { headers: { "X-CoinAPI-Key": apiKey.trim() } });
      if (r.ok) { const d = await r.json(); rates[id] = d.rate; }
    } catch { /* skip pair */ }
  }));
  const dxy = computeDxy(rates);
  return dxy != null ? { dxy, rates } : null;
}
