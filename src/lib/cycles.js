// ─── CYCLE BACKTESTING OVERLAY (handoff §8/§9.5) ─────────────────────────────
// Aligns each halving cycle by days-since-halving with price normalized to 100
// at the halving, so the current cycle can be read against 2016 and 2020.
// Doctrine framing (handoff §2): the halving is a synchronization marker, not a
// mechanical trigger — no two cycles are mirror images; use for context only.

export const HALVINGS = [
  { label: "2016", date: "2016-07-09" },
  { label: "2020", date: "2020-05-11" },
  { label: "2024", date: "2024-04-19" },
];

const DAY_MS = 86400000;
export const CYCLE_DAYS = 1460; // ~4 years

// prices: [{date:"YYYY-MM-DD", p:number}] daily ascending (from fetchPriceHistory)
// Returns { series, stats } or null.
export function buildCycleOverlay(prices, maxDays = CYCLE_DAYS) {
  if (!Array.isArray(prices) || prices.length < 500) return null;
  const byDate = new Map(prices.map(x => [x.date, x.p]));
  const dstr = ms => new Date(ms).toISOString().slice(0, 10);

  // Normalized (halving = 100) value for a cycle at day d, or null past data end.
  const normAt = (halvingMs, base, d) => {
    const p = byDate.get(dstr(halvingMs + d * DAY_MS));
    return p != null && base ? +(100 * p / base).toFixed(1) : null;
  };

  const cycles = HALVINGS.map(h => {
    const ms = new Date(h.date + "T00:00:00Z").getTime();
    return { ...h, ms, base: byDate.get(h.date) ?? null };
  }).filter(c => c.base);

  if (!cycles.length) return null;

  // Weekly-sampled overlay series.
  const series = [];
  for (let d = 0; d <= maxDays; d += 7) {
    const row = { day: d };
    for (const c of cycles) {
      const v = normAt(c.ms, c.base, d);
      if (v != null) row["c" + c.label] = v;
    }
    series.push(row);
  }

  // Per-cycle stats: peak multiple and the day it happened (daily resolution).
  // Peak search capped at 3 years: the final pre-next-halving year is the next
  // cycle's accumulation leg (e.g. the Mar-2024 ATH is not the 2020 cycle top).
  const TOP_WINDOW = 1095;
  const stats = { cycles: [], curDay: null, curMult: null };
  const nowMs = Date.now();
  for (const c of cycles) {
    let peak = null, peakDay = null;
    const lastDay = Math.min(TOP_WINDOW, maxDays, Math.floor((nowMs - c.ms) / DAY_MS));
    for (let d = 0; d <= lastDay; d++) {
      const v = normAt(c.ms, c.base, d);
      if (v != null && (peak == null || v > peak)) { peak = v; peakDay = d; }
    }
    stats.cycles.push({ label: c.label, halving: c.date, base: c.base, peakMult: peak != null ? peak / 100 : null, peakDay });
  }
  const cur = cycles[cycles.length - 1];
  stats.curDay = Math.floor((nowMs - cur.ms) / DAY_MS);
  const lastPrice = prices[prices.length - 1]?.p;
  stats.curMult = lastPrice && cur.base ? lastPrice / cur.base : null;
  return { series, stats };
}
