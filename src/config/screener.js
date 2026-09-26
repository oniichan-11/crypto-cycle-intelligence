// ─── REVENUE SCREENER CRITERIA (user-defined, 2026-09-26) ────────────────────
// Focus: ANY revenue-generating dapp/chain/protocol with reliable quantitative
// evidence (DefiLlama revenue), regardless of size. No market-cap band — the
// user removed it deliberately so unlisted/no-token protocols (lending markets,
// staking products, etc.) surface too, not just ones with a liquid token.
// Qualifies on sustained revenue: a 7-day floor (catches recent activity) AND
// a 30-day floor (catches one-off spikes that already faded). Every value here
// is tunable; the panel always reflects whatever is active.
export const SCREENER = {
  minRev7d:       1_000,      // 4 figures over the trailing 7 days
  minRev30d:     10_000,      // 5 figures over the trailing 30 days
  maxRows: 1000,               // safety ceiling well above current ~580 matches
  cacheMaxAgeMs: 2 * 3600000, // 2h — discovery data, not a live feed
};
