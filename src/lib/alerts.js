// ─── ALERTING LAYER (handoff §9.1) ───────────────────────────────────────────
// Threshold triggers on signal crosses. Each rule compares the previous signal
// snapshot with the current one and fires only on a transition — so a signal
// sitting in a zone doesn't re-alert every refresh. The previous snapshot is
// persisted to localStorage, so crosses are detected across page reloads too.

const SNAPSHOT_KEY = "cci_snapshot_v1";
const ALERTS_KEY   = "cci_alerts_v1";
const MAX_ALERTS   = 100;

// Snapshot = plain object of the raw signal values the rules care about.
export function buildSnapshot(s) {
  return {
    ts: Date.now(),
    mvrvZ:   s.mvrvZ ?? null,
    nupl:    s.nupl ?? null,
    sopr:    s.sopr ?? null,
    hrDiff:  s.hrDiff ?? null,
    funding: s.funding ?? null,
    netflow: s.netflow ?? null, // composite ∈ [-1,1]
    fg:      s.fg ?? null,      // 0–100
    dxy:     s.dxy ?? null,
    phase:   s.phase ?? null,   // verdict phase string
  };
}

const crossedUp   = (p, c, lvl) => p != null && c != null && p <  lvl && c >= lvl;
const crossedDown = (p, c, lvl) => p != null && c != null && p >= lvl && c <  lvl;
const flippedSign = (p, c)      => p != null && c != null && Math.sign(p) !== Math.sign(c) && c !== 0;

// severity: "info" | "warning" | "critical"
export const ALERT_RULES = [
  { id:"mvrvz-up-0",    sev:"info",     check:(p,c)=>crossedUp(p.mvrvZ,c.mvrvZ,0)   && `MVRV-Z crossed above 0 (${c.mvrvZ.toFixed(2)}) — exiting deep-value zone` },
  { id:"mvrvz-down-0",  sev:"info",     check:(p,c)=>crossedDown(p.mvrvZ,c.mvrvZ,0) && `MVRV-Z crossed below 0 (${c.mvrvZ.toFixed(2)}) — deep undervaluation, accumulation zone` },
  { id:"mvrvz-up-3",    sev:"critical", check:(p,c)=>crossedUp(p.mvrvZ,c.mvrvZ,3)   && `MVRV-Z crossed above 3 (${c.mvrvZ.toFixed(2)}) — overvaluation / distribution territory` },
  { id:"mvrvz-up-7",    sev:"critical", check:(p,c)=>crossedUp(p.mvrvZ,c.mvrvZ,7)   && `MVRV-Z crossed above 7 (${c.mvrvZ.toFixed(2)}) — historical cycle-top danger zone` },
  { id:"nupl-euphoria", sev:"critical", check:(p,c)=>crossedUp(p.nupl,c.nupl,0.75)  && `NUPL entered EUPHORIA (${(c.nupl*100).toFixed(1)}%) — systematic exit per doctrine` },
  { id:"nupl-belief",   sev:"warning",  check:(p,c)=>crossedUp(p.nupl,c.nupl,0.5)   && `NUPL entered BELIEF (${(c.nupl*100).toFixed(1)}%) — strong bull, raise alert level` },
  { id:"nupl-capit",    sev:"info",     check:(p,c)=>crossedDown(p.nupl,c.nupl,0)   && `NUPL entered CAPITULATION (${(c.nupl*100).toFixed(1)}%) — extreme buy signal` },
  { id:"sopr-down-1",   sev:"warning",  check:(p,c)=>crossedDown(p.sopr,c.sopr,1)   && `SOPR broke below 1.0 (${c.sopr.toFixed(4)}) — holders realizing losses` },
  { id:"sopr-up-1",     sev:"info",     check:(p,c)=>crossedUp(p.sopr,c.sopr,1)     && `SOPR reclaimed 1.0 (${c.sopr.toFixed(4)}) — profit-taking resumed / support held` },
  { id:"hr-cross-up",   sev:"info",     check:(p,c)=>flippedSign(p.hrDiff,c.hrDiff) && c.hrDiff>0 && `Hash Ribbons bullish cross (+${c.hrDiff.toFixed(2)}%) — miner recovery` },
  { id:"hr-cross-down", sev:"warning",  check:(p,c)=>flippedSign(p.hrDiff,c.hrDiff) && c.hrDiff<0 && `Hash Ribbons bearish cross (${c.hrDiff.toFixed(2)}%) — miner stress` },
  { id:"funding-hot",   sev:"warning",  check:(p,c)=>crossedUp(p.funding,c.funding,0.1)    && `Funding extreme (+${c.funding.toFixed(3)}%) — leverage flush risk high` },
  { id:"funding-neg",   sev:"info",     check:(p,c)=>crossedDown(p.funding,c.funding,-0.01)&& `Funding turned negative (${c.funding.toFixed(3)}%) — shorts paying, fuel remains` },
  { id:"netflow-flip",  sev:"warning",  check:(p,c)=>flippedSign(p.netflow,c.netflow)      && `Exchange netflow flipped to ${c.netflow>0?"INFLOW (capital entering)":"OUTFLOW (sell pressure)"}` },
  { id:"fg-extreme-fear", sev:"info",    check:(p,c)=>crossedDown(p.fg,c.fg,20) && `Fear & Greed entered EXTREME FEAR (${c.fg}) — contrarian accumulation signal` },
  { id:"fg-extreme-greed",sev:"warning", check:(p,c)=>crossedUp(p.fg,c.fg,80)   && `Fear & Greed entered EXTREME GREED (${c.fg}) — euphoria watch` },
  { id:"phase-change",  sev:"critical", check:(p,c)=>p.phase&&c.phase&&p.phase!==c.phase&&c.phase!=="SYNCING DATA"&&p.phase!=="SYNCING DATA" && `Cycle verdict changed: ${p.phase} → ${c.phase}` },
];

// Compare snapshots, return newly-fired alerts (possibly empty).
export function evaluateAlerts(prev, cur) {
  if (!prev || !cur) return [];
  const fired = [];
  for (const rule of ALERT_RULES) {
    let msg = null;
    try { msg = rule.check(prev, cur); } catch { /* rule must never crash the app */ }
    if (msg) fired.push({ id: rule.id, sev: rule.sev, msg, ts: cur.ts });
  }
  return fired;
}

// ── Persistence (localStorage; degrades silently if unavailable) ─────────────
export function loadSnapshot() {
  try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) || null; } catch { return null; }
}
export function saveSnapshot(snap) {
  try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap)); } catch { /* ignore */ }
}
export function loadAlerts() {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY)) || []; } catch { return []; }
}
export function saveAlerts(alerts) {
  try { localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.slice(0, MAX_ALERTS))); } catch { /* ignore */ }
}
export function clearAlerts() {
  try { localStorage.removeItem(ALERTS_KEY); } catch { /* ignore */ }
}
