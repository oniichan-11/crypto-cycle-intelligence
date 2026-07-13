# Crypto Cycle Intelligence — v0.5

Institutional-grade crypto research & investment agent on a **100% free data stack**.
Migrated from the single-file artifact (`crypto_intelligence_1.jsx`) per `PROJECT_HANDOFF.md` §11,
plus the **alerting layer**, **true exchange netflow**, and the **cycle backtesting overlay**.

## Run

**Easiest:** double-click `Start Dashboard.cmd` in the parent folder — starts the server
and opens http://localhost:5173 (close the window to stop). Verified working.

Or from a terminal in this folder:

```
npm install
npm run dev      # http://localhost:5173
npm test         # vitest — 29 logic tests incl. DXY invert regression guard
npm run build    # production bundle → dist/
```

## Structure

```
src/
├── App.jsx            # shell, state, polling (120s), verdict banner, alert engine hook
├── config/            # endpoints, coin universe, FRED series
├── lib/
│   ├── math.js        # mean/stdDev/movAvg + formatters
│   ├── signals.js     # zone interpreters (MVRV-Z, NUPL, SOPR, HR, funding, netflow)
│   ├── verdict.js     # weighted scoring engine (Tier 1 on-chain 2×)
│   ├── dxy.js         # DXY basket with EUR/GBP invert fix (§7 — do not remove)
│   └── alerts.js      # NEW: threshold-cross alert rules + localStorage persistence
├── fetchers/          # one module per data source; return data or null, never throw
├── components/        # Card, Badge, StatRow, MiniBar, FGGauge
└── panels/            # Overview, OnChain, Derivatives, Macro, Sectors, Signals, Alerts, ApiKeys
tests/signals.test.js  # logic stress tests
```

## Critical logic preserved verbatim (handoff §11)

1. DXY `invert:true` for EUR/GBP — reciprocal before exponent (regression-tested).
2. Verdict scoring weights — Tier 1 on-chain (MVRV-Z, NUPL) weighted 2× (±4 vs ±2).
3. Try/catch-per-fetch resilience — every fetcher degrades to `null` → UI shows "—", never crashes.
4. MVRV-Z σ over full history since 2018, not a fixed window.

## Alerting layer (new in v0.4)

`src/lib/alerts.js` — 17 rules that fire **only on threshold crosses** (never on level):
MVRV-Z crossing 0/3/7, NUPL entering Capitulation/Belief/Euphoria, SOPR losing/reclaiming 1.0,
hash-ribbon crosses, funding extremes, netflow flips, F&G extremes, verdict phase changes.
The previous signal snapshot + alert log persist in `localStorage`, so crosses are detected
across sessions (first pass at the §8 persistence backlog item). Verified live: the
netflow-flip rule fired legitimately when the true-flow legs came online.

## True exchange netflow (v0.5)

CoinMetrics moved `FlowInExNtv` / `FlowOutExNtv` / `SplyExNtv` **onto the free community
tier** — so the Glassnode-replacement proxy is now real data. The blend has three legs:
stablecoin supply Δ (DefiLlama), exchange balance Δ 7d (SplyExNtv), and 7d-mean net flow
in BTC/day (FlowIn − FlowOut). Composite semantics unchanged (∈ [−1,1], 2× in verdict).

## Cycle backtesting overlay (v0.5)

`src/lib/cycles.js` + Cycles tab — full daily price history (CM `PriceUSD`, free, cached 12h)
normalized to 100 at each halving and aligned by days-since-halving on a log chart, with
per-cycle top stats (2016: ~30× day 525; 2020: ~7.9× day 546; peak search capped at 3 years
so the next cycle's pre-halving run-up doesn't pollute the prior cycle's top). The context
read cross-references calendar position against the live on-chain verdict per doctrine §2.

## Live verification — 2026-07-12 (source drift since the handoff)

Verified in a real browser against every endpoint. The world moved; the wiring was updated:

| Was (handoff) | Now | Why |
|---|---|---|
| CoinMetrics `sort=asc/desc` | `paging_from=start/end` | v4 API rejects asc/desc; rows always arrive time-ascending |
| CoinMetrics `CapRealUSD` | Derived: `realCap = mktCap / CapMVRVCur` | Realized cap paywalled off the community tier (403); MVRV ratio still free — NUPL = 1 − 1/MVRV |
| CoinMetrics `SOPR` | BGeometrics `bitcoin-data.com/v1/sopr` | Paywalled (403); BGeometrics is free/keyless with CORS but rate-limited → fetched hourly with a 24h localStorage cache |
| CoinMetrics `SplyAct1yr` (netflow leg) | **Upgraded** to true flows: `FlowInExNtv`/`FlowOutExNtv`/`SplyExNtv` (now free) | Old proxy paywalled — but the real thing became free; catalog-v2 lists the community tier's 31 metrics |
| Binance `fapi.binance.com` funding | OKX `/api/v5/public/funding-rate` | Binance futures API sends no CORS headers — unusable from a browser |
| Frankfurter `api.frankfurter.app` | `api.frankfurter.dev/v1` (`base=`/`symbols=`) | API moved domains |
| — | Puell Multiple (BGeometrics) + Address Activity (CM `AdrActCnt`) wired | Backlog §9.3 items, display-only (not in verdict weights) |
| `remainingTime/86400` (mempool retarget) | `/86400000` | mempool.space returns ms, not seconds — pre-existing artifact bug |

## Backlog (from handoff §8)

- HODL Waves / LTH supply (BGeometrics `lth-supply` endpoint didn't respond; retry someday)
- Thermocap; sector rotation refinement (TVL growth, fee revenue)
- Signal history journal beyond alerts (daily snapshot log)

## Security

Never hardcode API keys. FRED/CoinAPI keys go only into the dashboard's input fields (session memory only).
