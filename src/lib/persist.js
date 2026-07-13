// ─── PANEL-STATE PERSISTENCE (handoff §8 backlog) ────────────────────────────
// The dashboard hydrates from the last-known data snapshot on load, so a page
// reload paints instantly and a transiently rate-limited API (CoinGecko free
// tier especially) never blanks the verdict back to "SYNCING DATA".

const KEY = "cci_panel_state_v1";
const MAX_AGE = 24 * 3600000; // stale after 24h — better to show SYNCING than day-old data

export function loadPanelState() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY));
    if (o && Date.now() - o.ts < MAX_AGE) return o.v;
  } catch { /* corrupt/absent — cold start */ }
  return null;
}

export function savePanelState(v) {
  try { localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), v })); } catch { /* quota — skip */ }
}
