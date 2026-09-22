import { LLAMA } from "../config/endpoints.js";
import { SCREENER } from "../config/screener.js";

// ─── REVENUE SCREENER (DefiLlama, free/keyless) ──────────────────────────────
// Joins three DefiLlama catalogs by protocol slug:
//   /protocols                          → market cap, TVL, 7d TVL change
//   /overview/fees                      → total fees (24h/7d/30d)
//   /overview/fees?dataType=dailyRevenue → protocol's own cut of those fees
// "Revenue" ≠ "fees": fees are what users pay, revenue is what the protocol/
// token actually captures — DefiLlama computes both, so we surface both rather
// than conflating them. A protocol qualifies if EITHER crosses the config
// floor over 30d, inside the user's market-cap band (config/screener.js).
//
// NOTE ON 90D: DefiLlama's free overview endpoints expose 24h/7d/30d/1y totals
// but no 90d bucket — there is no free way to get a reliable 90d figure without
// per-protocol historical calls (hundreds of extra requests). We report 7d/30d
// honestly rather than approximate a 90d number from thinner data.
//
// This pulls several MB across three endpoints, so it is cached in localStorage
// (2h) and fetched on its own cadence — never the dashboard's 120s loop.

const CACHE_KEY = "cci_screener_v1";

function cacheGet() {
  try {
    const o = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (o) return o; // caller decides freshness — stale cache still beats nothing
  } catch { /* ignore */ }
  return null;
}
function cacheSet(v) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), v })); } catch { /* quota — skip */ }
}

export async function fetchScreenerResults({ force = false } = {}) {
  const cached = cacheGet();
  if (!force && cached && Date.now() - cached.ts < SCREENER.cacheMaxAgeMs) {
    return { ...cached.v, stale: false, cachedAt: cached.ts };
  }

  try {
    const [protoRes, feesRes, revRes] = await Promise.all([
      fetch(`${LLAMA}/protocols`),
      fetch(`${LLAMA}/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`),
      fetch(`${LLAMA}/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyRevenue`),
    ]);
    if (!protoRes.ok || !feesRes.ok) throw new Error("primary fetch failed");

    const protocols = await protoRes.json();
    const feesData = await feesRes.json();
    const revData = revRes.ok ? await revRes.json() : { protocols: [] };

    const feesBySlug = new Map((feesData.protocols || []).map(p => [p.slug, p]));
    const revBySlug = new Map((revData.protocols || []).map(p => [p.slug, p]));

    const rows = [];
    for (const p of protocols) {
      if (!p.slug || p.mcap == null) continue;
      if (p.mcap < SCREENER.mcapMin || p.mcap > SCREENER.mcapMax) continue;
      const f = feesBySlug.get(p.slug);
      const r = revBySlug.get(p.slug);
      const fees7d = f?.total7d ?? null, fees30d = f?.total30d ?? null;
      const rev7d = r?.total7d ?? null, rev30d = r?.total30d ?? null;
      const passes = (rev30d != null && rev30d >= SCREENER.minRev30d) || (fees30d != null && fees30d >= SCREENER.minFees30d);
      if (!passes) continue;
      rows.push({
        slug: p.slug, name: p.name, symbol: p.symbol, category: p.category || "—",
        chains: p.chains || [], mcap: p.mcap, tvl: p.tvl, tvlChg7d: p.change_7d ?? null,
        fees7d, fees30d, rev7d, rev30d,
        // Annualized mcap/fees & mcap/revenue — a P/S-style ratio (30d × 12 as a rough annualizer).
        // Purely descriptive: lower = more revenue captured per dollar of market cap. Not a target.
        mcapToFeesAnn: fees30d ? p.mcap / (fees30d * 12) : null,
        mcapToRevAnn: rev30d ? p.mcap / (rev30d * 12) : null,
      });
    }
    rows.sort((a, b) => (b.fees30d ?? 0) - (a.fees30d ?? 0));
    const trimmed = rows.slice(0, SCREENER.maxRows);

    // Chain-level fee ranking from breakdown30d ({chainKey: {protocolName: fees}}),
    // which is genuinely split per chain — summing protocol totals across their
    // `chains` list would double-count multi-chain protocols on every chain they touch.
    const NOT_A_CHAIN = /^off.?chain$/i; // DefiLlama's bucket for fees not attributed to any blockchain
    const chainAgg = new Map();
    for (const f of feesData.protocols || []) {
      const bd = f.breakdown30d;
      if (!bd || typeof bd !== "object") continue;
      for (const [chainKey, byProtocol] of Object.entries(bd)) {
        if (NOT_A_CHAIN.test(chainKey)) continue;
        const sum = Object.values(byProtocol || {}).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
        if (!sum) continue;
        chainAgg.set(chainKey, (chainAgg.get(chainKey) || 0) + sum);
      }
    }
    const chains = [...chainAgg.entries()]
      .map(([chain, fees30d]) => ({ chain, fees30d }))
      .sort((a, b) => b.fees30d - a.fees30d)
      .slice(0, 15);

    const result = {
      rows: trimmed, chains,
      universeSize: protocols.length,
      matchedBeforeCap: rows.length,
      generatedAt: Date.now(),
    };
    cacheSet(result);
    return { ...result, stale: false, cachedAt: Date.now() };
  } catch {
    // Network/API failure — serve whatever cache exists, however old, rather than a blank screen
    if (cached) return { ...cached.v, stale: true, cachedAt: cached.ts };
    return null;
  }
}
