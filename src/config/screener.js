// ─── REVENUE SCREENER CRITERIA (user-defined, 2026-09-22) ────────────────────
// Focus: revenue-generating dapps/chains/protocols with reliable quantitative
// evidence (DefiLlama fees + revenue + TVL), not speculative narrative plays.
// Market-cap band is the user's own sizing thesis — assets small enough that a
// 5x move is structurally plausible, not a return this tool projects or implies.
// Every value here is tunable; the panel always reflects whatever is active.
export const SCREENER = {
  mcapMin:      15_000_000,   // floor — excludes illiquid micro-caps
  mcapMax:     750_000_000,   // ceiling — user's stated 5x-plausibility band
  minRev30d:      100_000,    // qualifies on EITHER protocol revenue ≥ this…
  minFees30d:     300_000,    // …OR total fees ≥ this, over trailing 30 days
  maxRows: 60,
  cacheMaxAgeMs: 2 * 3600000, // 2h — discovery data, not a live feed
};
