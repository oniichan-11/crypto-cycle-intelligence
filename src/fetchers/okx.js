import { OKX } from "../config/endpoints.js";

// Funding rates — OKX perps (Binance fapi blocks browser CORS; OKX is open).
// OKX returns the 8h rate as a fraction → ×100 for %.
export async function fetchFunding() {
  try {
    const results = {};
    const rb = await fetch(`${OKX}/public/funding-rate?instId=BTC-USDT-SWAP`);
    if (rb.ok) { const d = await rb.json(); const row = d?.data?.[0]; if (row) results.btc = parseFloat(row.fundingRate)*100; }
    const re = await fetch(`${OKX}/public/funding-rate?instId=ETH-USDT-SWAP`);
    if (re.ok) { const d = await re.json(); const row = d?.data?.[0]; if (row) results.eth = parseFloat(row.fundingRate)*100; }
    const rh = await fetch(`${OKX}/public/funding-rate-history?instId=BTC-USDT-SWAP&limit=30`);
    if (rh.ok) {
      const d = await rh.json();
      // history arrives newest-first → reverse for the chart
      results.history = (d?.data||[]).map(x=>({t:new Date(parseInt(x.fundingTime)).toLocaleDateString("en",{month:"short",day:"numeric"}),rate:parseFloat(x.realizedRate??x.fundingRate)*100})).reverse();
    }
    if (results.btc == null) return null;
    const agg = results.eth != null ? (results.btc+results.eth)/2 : results.btc; // simple aggregate benchmark
    return { binance: results.btc, eth: results.eth, aggregate: agg, history: results.history || [] };
  } catch { return null; }
}
