import { CG } from "../config/endpoints.js";
import { COINS } from "../config/coins.js";

// Every fetcher returns parsed data or null — never throws (resilience pattern).
export async function fetchBtc() {
  try {
    const r = await fetch(`${CG}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

export async function fetchGlobal() {
  try {
    const r = await fetch(`${CG}/global`);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.data || null;
  } catch { return null; }
}

export async function fetchSectorMarkets() {
  try {
    const r = await fetch(`${CG}/coins/markets?vs_currency=usd&ids=${COINS.map(c=>c.id).join(",")}&order=market_cap_desc&per_page=20&page=1&price_change_percentage=7d`);
    if (!r.ok) return null;
    const d = await r.json();
    return Array.isArray(d) ? d : null;
  } catch { return null; }
}
